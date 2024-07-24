// const mongoose = require('mongoose');
// const { UserRepository } = require('../../src/repository/user.repository');
// const { isValidPassword } = require('../../src/utils/hashing');

// describe('Testing Users Repository', () => {
//     let chai;
//     let expect;
//     let connection = null;
//     const userRepository = new UserRepository()

//     before(async function () {
//         chai = await import('chai');
//         expect = chai.expect;

//         // Se ejecuta UNA ÚNICA vez, antes de todos los test de la suite
//         this.timeout(10000); // Configurar el tiempo de espera para la conexión
//         const mongooseConnection = await mongoose.connect('mongodb://localhost:27017/', { dbName: 'testing' });
//         connection = mongooseConnection.connection;
//     });

//     after(async () => {
//         // Se ejecuta UNA ÚNICA vez, luego de todos los test de la suite
//         await connection.db.dropDatabase();
//         await connection.close();
//     });

//     beforeEach(function () {
//         // Se ejecuta antes de cada test dentro de esta suite
//         this.timeout(10000); // Configurar el test para que mocha lo espere durante 10 segundos
//     });

//     afterEach(async () => {
//         // Se ejecuta luego de cada test dentro de esta suite
//     });

//     it('Se debe registrar un usuario de forma correcta', async () => {
//         const user = await userRepository.registerUser('Pepito', 'Pepazzo', 33, 'test@test.com', '123');
//         expect(user).to.be.ok;
//     });

//     it('El nombre, apellido, rol, edad y carrito se deben generar automaticamente', async () => {
//         const user = await userRepository.registerUser(undefined, undefined, undefined, 'retesteo@test.com', '123');

//         expect(user).to.be.ok;
//         expect(user.firstName).to.be.equal('Usuario');
//         expect(user.lastName).to.be.equal('Sin Identificar');
//         expect(user.age).to.be.equal(0);
//         expect(Array.isArray(user.cart.products)).to.be.ok;
//         expect(user.rol).to.be.equal('user');
//     });

//     it('La contraseña debe estar hasheada', async () => {
//         const password = 'password123'
//         const user = await userRepository.registerUser(undefined, undefined, undefined, 'hashtest@test.com', password);
//         const verifyHasedPassword = isValidPassword(password, user.password);

//         expect(user).to.be.ok;
//         expect(user.password).to.not.equal(password);
//         expect(verifyHasedPassword).to.be.true;
//     });

//     it('El usuario se puede logear de forma correcta', async () => {
//         const email = 'logintest@test.com';
//         const password = '123456';
//         const user = await userRepository.registerUser('Carlos', 'Sainz', 55, email, password);
//         expect(user).to.be.ok;
//         const loginUser = await userRepository.loginUser(email, password);
//         expect(loginUser).to.be.ok;
//         expect(loginUser.userPayload.firstName).to.be.equal('Carlos');
//         expect(loginUser.userPayload.lastName).to.be.equal('Sainz');
//         expect(loginUser.userPayload.rol).to.be.equal('user');
//     });

//     it('Se obtiene el usuario según su ID de manera correcta', async () => {
//         const email = 'getuser@test.com';
//         const password = '12345fg6';
//         await userRepository.registerUser('Fernando', 'Alonso', 14, email, password);
//         const user = await userRepository.loginUser(email, password);
//         const userById = await userRepository.getUserById(user.userPayload.id);
//         expect(userById.firstName).to.be.equal('Fernando');
//         expect(userById.id).to.be.equal(user.userPayload.id);
//     });
// });