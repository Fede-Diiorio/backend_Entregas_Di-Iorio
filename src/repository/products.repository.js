const ProductDAO = require('../dao/mongo/products.dao');
const UserDAO = require('../dao/mongo/users.dao');
const { ProductDTO } = require('../dto/product.dto');
const { CustomError } = require('../utils/errors/customErrors');
const { ErrorCodes } = require('../utils/errors/errorCodes');
const { generateInvalidProductData } = require('../utils/errors/errors');
const { MailingService } = require('../utils/mailingService');

class ProductRepository {
    #userDAO
    constructor() {
        this.productDAO = new ProductDAO();
        this.#userDAO = new UserDAO();
    }

    #validateAndFormatGetProductsParams(page, limit, sort, category, availability) {
        try {
            const query = {
                ...(category && { category }),
                ...(availability && { status: availability === 'true' })
            };

            const options = {
                limit: limit ? parseInt(limit) : 10,
                page: parseInt(page),
                sort: sort ? { price: sort } : undefined,
                lean: true
            };

            if (isNaN(page)) {
                throw CustomError.createError({
                    name: 'La página no existe',
                    cause: 'La página debe ser un número válido',
                    message: 'La página no existe',
                    code: ErrorCodes.INVALID_PAGE_NUMBER,
                    status: 400
                });
            }

            return { query, options };
        } catch (e) {
            throw e;
        }
    }

    async #validateAndFormatAddProductsParams(title, description, price, thumbnail, code, stock, category, owner) {

        const invalidOptions = isNaN(+price) || +price <= 0 || isNaN(+stock) || +stock < 0;

        if (!title || !description || !code || !category || invalidOptions) {
            throw CustomError.createError({
                name: 'Error al agregar el producto.',
                cause: generateInvalidProductData(title, description, price, thumbnail, code, stock, category),
                message: 'No se pudo agregar el producto a la base de datos.',
                code: ErrorCodes.INVALID_PRODUCT_DATA,
                status: 400
            });
        }

        const finalThumbnail = thumbnail ? `../products/${thumbnail.originalname}` : 'Sin Imagen';

        const finalStatus = stock >= 1 ? true : false;

        const user = await this.#userDAO.findByEmail(owner);

        const finalOwner = user && user.rol === 'premium' ? user.email : 'admin';

        const existingCode = await this.productDAO.findByCode(code);

        if (existingCode) {
            throw CustomError.createError({
                name: 'Error al agregar el producto.',
                cause: `El código de producto '${code}' ya está en uso. Ingrese un código diferente.`,
                message: 'Código de producto repetido.',
                code: ErrorCodes.DUPLICATE_PRODUCT_CODE,
                status: 409
            });
        }

        const newProduct = {
            title,
            description,
            price,
            thumbnail: finalThumbnail,
            code,
            status: finalStatus,
            stock,
            category,
            owner: finalOwner
        };

        return newProduct;
    }

    async getProducts() {
        try {
            const products = await this.productDAO.getProducts();
            const productsPayload = products.map(prod => new ProductDTO(prod));
            return productsPayload;
        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error al conectar',
                cause: error.cause || 'Ocurrió un error al buscar los productos en la base de datos',
                message: error.message || 'No se pudieron obtener los productos de la base de datos',
                code: error.code || ErrorCodes.DATABASE_ERROR,
                status: error.status || 500
            });
        }
    }

    async getPaginateProducts(page, limit, sort, category, availability) {
        try {
            const { query, options } = this.#validateAndFormatGetProductsParams(page, limit, sort, category, availability);
            const products = await this.productDAO.getPaginateProducts(query, options);

            if (!products || !products.docs.length) {
                return [];
            }

            if (isNaN(page) || page > products.totalPages) {
                throw CustomError.createError({
                    name: 'Error en el paginado',
                    cause: 'La página no existe o no ha ingresado un número válido',
                    message: 'La página a la que intenta acceder no existe',
                    code: ErrorCodes.INVALID_PAGE_NUMBER,
                    status: 400
                });
            }


            return products;

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error al conectar',
                cause: error.cause || 'Ocurrió un error al buscar los productos en la base de datos',
                message: error.message || 'No se pudieron obtener los productos de la base de datos',
                code: error.code || ErrorCodes.DATABASE_ERROR,
                status: error.status || 500
            });
        }
    }

    async getProductById(id) {
        try {
            const product = await this.productDAO.getProductById(id);
            return new ProductDTO(product);
        } catch {
            throw CustomError.createError({
                name: 'El producto no existe',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                message: 'El producto no existe',
                code: ErrorCodes.UNDEFINED_PRODUCT,
                status: 404
            });
        }
    }

    async addProduct(productData) {
        try {
            const { title, description, price, thumbnail, code, stock, category, owner } = productData;
            const productHandler = await this.#validateAndFormatAddProductsParams(title, description, price, thumbnail, code, stock, category, owner);
            const product = await this.productDAO.addProduct(productHandler);
            return new ProductDTO(product);
        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error al crear producto',
                cause: error.cause || 'No se pudo crear el producto por falta de datos o existe un problema para cargarlo a la base de datos',
                message: error.message || 'No se pudo cargar el producto a la base de datos',
                code: error.code || ErrorCodes.PRODUCT_CREATION_ERROR,
                status: error.status || 500
            })
        }
    }

    async updateProduct(id, productData) {
        try {
            await this.getProductById(id);

            // Verificar si se proporcionaron campos para actualizar
            const areFieldsPresent = Object.keys(productData).length > 0;
            if (!areFieldsPresent) {
                throw CustomError.createError({
                    name: 'Campos inválidos',
                    cause: 'Debe definir al menos un campo para actualizar',
                    message: 'Campos inválidos',
                    code: ErrorCodes.PRODUCT_UPDATE_ERROR,
                    status: 500
                });
            }

            // Actualizar el producto
            await this.productDAO.updateProduct(id, productData);

            const updatedProduct = await this.productDAO.getProductById(id);
            return new ProductDTO(updatedProduct);

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error al actualizar',
                cause: error.cause || 'Ocurrió un error y la actualización del producto no pudo ser llevada a cabo',
                message: error.message || 'No se pudo actualizar el producto',
                code: error.code || ErrorCodes.PRODUCT_UPDATE_ERROR,
                status: error.status || 500
            });
        }
    }

    async deleteProduct(productId, user) {

        const product = await this.getProductById(productId);
        if (user.rol === 'admin' || user.rol === 'superAdmin') {
            const userPayload = await this.#userDAO.findByEmail(product.owner);
            if (userPayload) {
                await new MailingService().sendNotificationOfProductRemoved(userPayload.email, userPayload.firstName, userPayload.lastName, product.title, product.id);
            }
            return await this.productDAO.deleteProduct(productId);
        } else if (product.owner && product.owner === user.email) {
            return await this.productDAO.deleteProduct(productId);
        } else {
            throw CustomError.createError({
                name: 'Solicitud rechazada',
                cause: 'No posee los permisos correspondientes para llevar a cabo esta acción',
                message: 'No se pudo eliminar el producto',
                code: ErrorCodes.PRODUCT_DELETION_ERROR,
                status: 500
            })
        }

    }
}

module.exports = { ProductRepository };
