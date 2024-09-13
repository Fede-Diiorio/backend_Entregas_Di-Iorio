import 'dotenv/config';
import UserDAO from '../dao/mongo/users.dao.js';
import CartDAO from '../dao/mongo/carts.dao.js';
import { hashPassword, isValidPassword } from '../utils/hashing.js';
import { generateToken, generatePasswordRecoveryToken } from '../middlewares/jwt.middleware.js';
import { UserDTO } from '../dto/user.dto.js';
import { getUsersDTO } from '../dto/getUsers.dto.js';
import CustomError from '../utils/errors/customErrors.js';
import { ErrorCodes } from '../utils/errors/errorCodes.js';
import { generateInvalidCredentialsUserData } from '../utils/errors/errors.js';
import MailingService from '../utils/mailingService.js';

export default class UserRepository {

    #userDAO;
    #cartDAO;
    #adminUser;
    #superAdminUser;

    constructor() {
        this.#userDAO = new UserDAO();
        this.#cartDAO = new CartDAO();

        this.#adminUser = {
            _id: 'admin',
            firstName: 'Luciano',
            lastName: 'Staniszewski',
            age: 18,
            email: process.env.ADMIN_USER,
            password: process.env.ADMIN_PASS,
            rol: 'admin',
            documents: []
        };

        this.#superAdminUser = {
            _id: 'superAdmin',
            firstName: 'Lucas',
            lastName: 'Pereyra',
            age: 28,
            email: process.env.SADMIN_USER,
            password: process.env.SADMIN_PASS,
            rol: 'superAdmin',
            documents: []
        };
    };

    #validateLoginCredentials(email, password) {
        if (!email || !password) {
            throw CustomError.createError({
                name: 'Credenciales inválidas',
                cause: generateInvalidCredentialsUserData(email, password),
                message: 'Debe ingresar un usuario y contraseña válidas',
                code: ErrorCodes.INVALID_CREDENTIALS,
                status: 401
            });
        };
    };

    async #generateNewUser(firstName, lastName, age, email, password, cart) {
        try {
            this.#validateLoginCredentials(email, password);

            if (age <= 0) {
                throw CustomError.createError({
                    name: 'Error en la edad',
                    cause: 'Debe ingresar un número válido mayor a 0',
                    message: 'Edad inválida',
                    code: ErrorCodes.AGE_VALIDATION_ERROR,
                    status: 400
                });
            };

            const hashedPassword = hashPassword(password);

            const user = {
                firstName: firstName || 'Usuario',
                lastName: lastName || 'Sin Identificar',
                age: parseInt(age) || 0,
                email,
                password: hashedPassword,
                cart
            };

            return user;

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error de registro',
                cause: error.cause || 'Ocurrió un error al registrar el usuario en la base de datos',
                message: error.message || 'Algo salió mal al generar un nuevo usuario',
                code: error.code || ErrorCodes.USER_REGISTER_ERROR,
                status: error.status || 500
            });
        };
    };

    #generateAccessToken(user) {
        return generateToken({
            email: user.email,
            id: user.id,
            rol: user.rol,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            cart: user.cart,
            documents: user.documents,
            picture: user.picture
        });
    };

    async #verifyUser(id) {
        try {
            const user = await this.#userDAO.findById(id);

            return user;

        } catch {
            throw CustomError.createError({
                name: 'Usuario inválido',
                cause: 'El ID del usuario ingresado no se ecuentra registrado en la base de datos.',
                message: 'ID desconocido',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            });
        };
    };

    async registerUser(firstName, lastName, age, email, password) {
        try {
            if (email === this.#adminUser.email || email === this.#superAdminUser.email) {
                throw CustomError.createError({
                    name: 'Error de registro',
                    cause: 'No se puede registrar el usuario administrador o superadministrador de esta manera',
                    message: 'No tiene permisos para registrar estos usuarios',
                    code: ErrorCodes.ADMIN_USER_REGISTRATION_ERROR,
                    status: 400
                });
            };

            const existingUser = await this.#userDAO.findByEmail(email);

            if (existingUser) {
                throw CustomError.createError({
                    name: 'Error de registro',
                    cause: 'El email se encuentra registrado en la base de datos. Intente válidar sus credenciales.',
                    message: 'El email ya está registrado',
                    code: ErrorCodes.EMAIL_ALREADY_REGISTERED,
                    status: 409
                });
            };

            const cart = await this.#cartDAO.addCart({ products: [] });
            const user = await this.#generateNewUser(firstName, lastName, age, email, password, cart);

            await this.#userDAO.create(user);

            const updateConnection = await this.#userDAO.findByEmail(email);
            await this.updateConnection(updateConnection._id);

            return user;

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error de registro',
                cause: error.cause || 'Algo salió mal al registrar un nuevo usuario.',
                message: error.message || 'No se pudo crear un nuevo usuario',
                code: error.code || ErrorCodes.USER_REGISTER_ERROR,
                status: error.status || 500
            });
        };
    };

    async loginUser(email, password) {
        try {
            this.#validateLoginCredentials(email, password);

            let user;

            if (email === this.#adminUser.email && password === this.#adminUser.password) {

                user = this.#adminUser;

            } else if (email === this.#superAdminUser.email && password === this.#superAdminUser.password) {

                user = this.#superAdminUser;

            } else {
                user = await this.#userDAO.findByEmail(email);

                if (!user || !isValidPassword(password, user.password)) {
                    throw CustomError.createError({
                        name: 'Error de logeo',
                        cause: 'Ingresó una contraseña incorrecta. Intenté nuevamente o cambie la misma',
                        message: 'Contraseña incorrecta',
                        code: ErrorCodes.INVALID_PASSWORD,
                        status: 401
                    });
                };
            };

            const date = new Date();
            await this.#userDAO.lastConnection(email, date);

            const userPayload = new UserDTO(user);

            const accessToken = this.#generateAccessToken(userPayload);

            return { accessToken, userPayload };

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error de logeo',
                cause: error.cause || 'Ocurrio validar sus credenciales. Intente nuevamente o cambie su contraseña',
                message: error.message || 'Contraseña incorrecta',
                code: error.code || ErrorCodes.USER_LOGIN_ERROR,
                status: error.status || 500
            });
        };
    };

    async sendMailToResetPassword(email) {
        if (!email) {
            throw CustomError.createError({
                name: 'Sin email',
                cause: 'Es necesario que ingrese un email para poder continuar con el cambio de contraseña',
                message: 'Debe ingresar un email',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            });
        };

        const user = await this.#userDAO.findByEmail(email);

        if (!user) {
            if (!user) {
                throw CustomError.createError({
                    name: 'Email desconocido',
                    cause: 'Está intentando cambiar la contraseña de un email que no se encuentra registrado',
                    message: 'El email no se encuentra registrado',
                    code: ErrorCodes.UNDEFINED_USER,
                    status: 404
                });
            };
        };

        const passToken = (await new MailingService().sendMail(email));

        const handlerPassToken = generatePasswordRecoveryToken(passToken.randomNumber, passToken.email);

        return handlerPassToken;
    };

    async resetPassword(urlToken, token, newPassword, confirmPassword) {
        const { code, email } = token;

        if (!newPassword || !confirmPassword) {
            throw CustomError.createError({
                name: 'Datos faltantes',
                cause: 'Es necesario que ingrese una nueva contraseña y la confirmación de la misma',
                message: 'Debe completar todos los cambios',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR,
                status: 400
            });
        };

        const isValidToken = urlToken === code.toString();

        if (!isValidToken) {
            throw CustomError.createError({
                name: 'Link inválido',
                cause: 'El link no es válido o ha expirado. Vuelva a enviar el mail de confirmación.',
                message: 'El link no es válido o ha expirado.',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR,
                status: 410
            });
        };

        if (newPassword !== confirmPassword) {
            throw CustomError.createError({
                name: 'Contraseña inválida',
                cause: 'Las dos contraseñas ingresadas deben coincidir para poder continuar con la actualización',
                message: 'Las dos contraseñas no coinciden',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR,
                status: 400
            });
        };

        const user = await this.#userDAO.findByEmail(email);

        const confirmValidPassword = isValidPassword(newPassword, user.password);

        if (confirmValidPassword) {
            throw CustomError.createError({
                name: 'Contraseña inválida',
                cause: 'La la nueva contraseña no puede ser igual a la contraseña anterior.',
                message: 'Debe actualizar su contraseña',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR,
                status: 400
            });
        };

        const updatedUser = await this.#userDAO.updatePassword(email, hashPassword(newPassword));

        return updatedUser;

    };

    async githubLogin(profile) {
        try {
            if (profile._json.email === null) {
                throw CustomError.createError({
                    name: 'Email inválido',
                    cause: 'No se pudo completar el registro dado a que no se pudo acceder al email de github. Asegurate de compartir esta información desde tu cuenta de github.',
                    message: 'Hubo un problema con su cuenta de github',
                    code: ErrorCodes.GITHUB_LOGIN_ERROR,
                    status: 400
                });
            };

            const user = await this.#userDAO.findByEmail(profile._json.email);

            const currentTime = new Date();

            await this.#userDAO.lastConnection(profile._json.email, currentTime);

            if (!user) {
                const fullName = profile._json.name;
                const firstName = fullName.substring(0, fullName.lastIndexOf(' '));
                const lastName = fullName.substring(fullName.lastIndexOf(' ') + 1);
                const age = 18;
                const password = '123';

                const newUser = await this.registerUser(firstName, lastName, age, profile._json.email, password);
                const accessToken = this.#generateAccessToken(newUser);

                return { accessToken, user: newUser };
            };

            const accessToken = this.#generateAccessToken(user);

            return { accessToken, user };

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error de logeo',
                cause: error.cause || 'Ocurrió un error inesperado y no se pudo emparejar su cuenta de github en la base de datos',
                message: error.message || 'Hubo un problema con su cuenta de github',
                code: error.code || ErrorCodes.GITHUB_LOGIN_ERROR,
                status: error.status || 500
            });
        };
    };

    async deleteUser(email) {
        try {
            const user = await this.#userDAO.findByEmail(email);

            if (user) {

                await this.#cartDAO.deleteCart(user.cart);
                await this.#userDAO.deleteByEmail(email);

            } else {
                throw CustomError.createError({
                    name: 'Email desconocido',
                    cause: 'Está intentando eliminar un usuario con un email que no se encuentra registrado',
                    message: 'El email no se encuentra registrado',
                    code: ErrorCodes.UNDEFINED_USER,
                    status: 404
                });
            };

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error al eliminar el usuario',
                cause: error.cause || 'Su petición no fue procesada de forma correcta y no se pudo eliminar el usuario.',
                message: error.message || 'Hubo un problema y no se pudo elimiar el usuario',
                code: error.code || ErrorCodes.USER_DELETION_ERROR,
                status: error.status || 500
            });
        };
    };

    async getUserById(id) {
        try {
            if (id === 'admin') {
                return new UserDTO(this.#adminUser);

            } else if (id === 'superAdmin') {
                return new UserDTO(this.#superAdminUser);

            } else {
                const user = await this.#userDAO.findById(id);

                return new UserDTO(user);
            };

        } catch {
            throw CustomError.createError({
                name: 'Email desconocido',
                cause: 'Ha ingresado un ID inválido o el usuario no se encuentra registrado en la base de datos',
                message: 'El email no se encuentra registrado',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            });
        };
    };

    async changeRole(id) {
        try {
            const user = await this.#verifyUser(id);

            if (user.rol === 'user' && user.documents.length === 3) {
                await this.#userDAO.updateRole(user.email, 'premium');
                const updatedUser = await this.#userDAO.findById(id);

                return new UserDTO(updatedUser);

            } else if (user.rol === 'premium') {
                await this.#userDAO.updateRole(user.email, 'user');
                const updatedUser = await this.#userDAO.findById(id);

                return new UserDTO(updatedUser);

            } else {
                throw CustomError.createError({
                    name: 'No se puede actualizar',
                    cause: 'No se ha podido actualizar el rol del usuario por falta de documentación',
                    message: 'Falta de documentación',
                    code: ErrorCodes.UNDEFINED_DATA,
                    status: 400
                });
            };

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'No se puede actualizar el rol',
                cause: error.cause || 'Algo salió mal con el proceso de actualización y la operación no pudo completarse',
                message: error.message || 'Ocurrió un error inesperado',
                code: error.code || ErrorCodes.UNDEFINED_DATA,
                status: error.status || 400
            });
        };
    };

    async updateConnection(id) {
        const user = await this.#userDAO.findById(id);

        if (user) {
            const date = new Date();
            await this.#userDAO.lastConnection(user.email, date);
        };
    };

    async updateUserDocuments(userId, files) {
        const user = await this.#verifyUser(userId);

        if (!files) {
            throw CustomError.createError({
                name: 'Campos vacíos',
                cause: 'No se pudo completar la operación, debe cargar al menos un archivo a la documentación.',
                message: 'No puede enviar un formulario vacío',
                code: ErrorCodes.UNDEFINED_DATA,
                status: 400
            });
        };

        const newDocuments = [];

        if (files.identification) {
            newDocuments.push({
                name: 'identification',
                reference: `/public/documents/${files.identification[0].filename}`
            });
        };

        if (files.proofOfAddress) {
            newDocuments.push({
                name: 'proofOfAddress',
                reference: `/public/documents/${files.proofOfAddress[0].filename}`
            });
        };

        if (files.proofOfAccount) {
            newDocuments.push({
                name: 'proofOfAccount',
                reference: `/public/documents/${files.proofOfAccount[0].filename}`
            });
        };

        const updatedDocuments = user.documents.filter(doc => !newDocuments.some(newDoc => newDoc.name === doc.name));
        updatedDocuments.push(...newDocuments);

        await this.#userDAO.updateDocuments(userId, updatedDocuments);

        return await this.#userDAO.findById(userId);
    };

    async updatePicture(userId, file) {
        await this.#verifyUser(userId);

        if (file === undefined) {
            throw CustomError.createError({
                name: 'Campo vacio',
                cause: 'No se pudo completar la operación, debe seleccionar un archivo para actulizar su perfil',
                message: 'No puede enviar un formaulario vacio',
                code: ErrorCodes.UNDEFINED_DATA,
                status: 400
            });
        };

        const picture = `/public/profile/${file.filename}`;

        await this.#userDAO.updatePicture(userId, picture);
    };

    async getUsers() {
        const users = await this.#userDAO.findAll();

        if (!users) {
            throw CustomError.createError({
                name: 'Error de usuarios',
                cause: 'Ha ocurrido un error inesperado y no se han podido retornas los usuarios de la base de datos',
                message: 'No se pudieron retornar los productos de la base de datos',
                code: ErrorCodes.DATABASE_ERROR,
                status: 500
            })
        };

        const usersPayload = users.map(user => new getUsersDTO(user));

        return usersPayload;
    };

    async deleteUsers() {
        const users = await this.#userDAO.findAll();
        const currentTime = new Date();
        const thirtyMinutesInMs = 60 * 60 * 48 * 1000;
        const inactiveUsers = [];

        users.forEach(user => {
            const lastConnectionDate = new Date(user.last_connection);

            const timeDifference = currentTime - lastConnectionDate;

            if (timeDifference > thirtyMinutesInMs) {
                inactiveUsers.push(user);
            };
        });

        for (const user of inactiveUsers) {
            await this.deleteUser(user.email);
            await this.#cartDAO.getCartById(user.cart);

            await new MailingService().sendDeletionNotification(user.email, user.firstName, user.lastName);
        };

        return inactiveUsers;
    };
};