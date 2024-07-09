require('dotenv').config();
const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../../src/app');
const requester = supertest(app);

let chai;
let expect;
let server; // Variable para almacenar la instancia del servidor

describe('Testing Ecommerce', () => {
    before(async function () {
        // Se ejecuta UNA ÚNICA vez, antes de todos los test de la suite
        this.timeout(10000); // Configurar el tiempo de espera para la conexión
        const mongooseConnection = await mongoose.connect('mongodb://localhost:27017/', { dbName: 'testing' });
        connection = mongooseConnection.connection;

        // Iniciar el servidor
        server = app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });

        // Importar chai dinámicamente
        chai = await import('chai');
        expect = chai.expect;
    });

    after(async () => {
        // Se ejecuta UNA ÚNICA vez, luego de todos los test de la suite
        await connection.db.dropDatabase();
        await connection.close();

        // Cerrar el servidor
        if (server) {
            server.close(() => {
                console.log('Servidor cerrado');
                process.exit(0); // Salir del proceso de Node.js
            });
        } else {
            process.exit(0); // Salir del proceso de Node.js
        }
    });

    beforeEach(function () {
        // Se ejecuta antes de cada test dentro de esta suite
        this.timeout(10000); // Configurar el test para que mocha lo espere durante 10 segundos
    });

    afterEach(async () => {
        // Se ejecuta luego de cada test dentro de esta suite
    });

    describe('Test de productos', () => {
        it('El endpoint GET /api/products debe devolver todos los productos de la base de datos o un array vacio', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products');
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body)).to.be.ok;
        });

        it('El endpoint GET /api/products/:pid debe devolver un producto según su ID', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc123',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            const pid = product.body.id;
            const { statusCode, ok, body } = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body.title).to.equal('Test Product');
            expect(body.thumbnail).to.equal('Sin Imagen');
        });

        it('El endpoint POST /api/products/ debe crear un producto de manera correcta', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc124',
                stock: 80,
                category: 'almacenamiento'
            };

            const { statusCode, ok, body } = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            expect(ok).to.be.true;
            expect(statusCode).to.be.equal(201);
            expect(body.status).to.be.equal(true);
            expect(body).to.have.property('id');
        });

        it('El endpoint PUT /api/product/:pid debe actualizar el producto de forma correcta', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc125',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            const pid = product.body.id;

            const updatedProductMock = {
                title: 'Updated Product',
                price: 350
            };

            const updatedProduct = await requester
                .put(`/api/products/${pid}`)
                .set('Cookie', cookie)
                .send(updatedProductMock);

            expect(product.body.title).to.equal('Test Product');
            expect(product.body.price).to.equal(300);
            expect(updatedProduct.body.title).to.equal('Updated Product');
            expect(updatedProduct.body.price).to.equal(350);
            expect(product.body.stock).to.equal(updatedProduct.body.stock);
            expect(updatedProduct.statusCode).to.equal(201);
            expect(updatedProduct.ok).to.be.ok;
        });

        it('El endpoint DELETE /api/products/:pid debe eliminar el producto de la base de datos', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc126',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const { statusCode, ok } = await requester
                .delete(`/api/products/${pid}`)
                .set('Cookie', cookie)

            const verifyProduct = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(204);
            expect(ok).to.equal(true);
            expect(verifyProduct.statusCode).to.equal(404);
        });
    });

    describe('Test de carts', () => {
        it('El endpoint GET /api/cart debe devolver todos los carritos de la base de datos o un array vacio', async () => {
            const { statusCode, ok, body } = await requester.get('/api/cart');
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body)).to.be.ok;
        });

        it('El endpoint GET /api/cart/:cid debe devolver un carrito según su ID', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const cart = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            const cid = cart.body._id;

            const { statusCode, ok, body } = await requester.get(`/api/cart/${cid}`);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;

        });

        it('El endpoint POST /api/cart debe agregar un nuevo carrito a la base de datos', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const { statusCode, ok, body } = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            expect(statusCode).to.equal(201);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
        });

        it('El endpoint POST /api/cart/:cid/product/:pid debe agregar un producto al carrito', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc126',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const newUser = {
                email: 'test@test.com',
                password: '123'
            };

            await requester.post('/api/sessions/register').send(newUser);

            const loginResponseUser = await requester.post('/api/sessions/login').send(newUser);
            const cookieUser = loginResponseUser.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const { statusCode, ok, body } = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product).to.equal(pid);
        });

        it('El endpoint DELETE /api/cart/:cid/product/:pid debe eliminar un producto del carrito', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc127',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const newUser = {
                email: 'test2@test.com',
                password: '123'
            };

            await requester.post('/api/sessions/register').send(newUser);

            const loginResponseUser = await requester.post('/api/sessions/login').send(newUser);
            const cookieUser = loginResponseUser.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok, body } = await requester
                .delete(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products).to.deep.equal([]);
        });

        it('El endpoint PUT /api/cart/:cid debe actualizar el carrito de forma correcta', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc128',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const newUser = {
                email: 'test3@test.com',
                password: '123'
            };

            await requester.post('/api/sessions/register').send(newUser);

            const loginResponseUser = await requester.post('/api/sessions/login').send(newUser);
            const cookieUser = loginResponseUser.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productToUpdate = [{
                product: pid,
                quantity: 20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .set('Cookie', cookieUser) // Incluir la cookie en el encabezado
                .send(productToUpdate);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product._id).to.equal(pid);
            expect(body.products[0].quantity).to.equal(20);
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe actualizar la cantidad de producto en el carrito', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc129',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const newUser = {
                email: 'test4@test.com',
                password: '123'
            };

            await requester.post('/api/sessions/register').send(newUser);

            const loginResponseUser = await requester.post('/api/sessions/login').send(newUser);
            const cookieUser = loginResponseUser.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)
                .send(quantity);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product._id).to.equal(pid);
            expect(body.products[0].quantity).to.equal(20);
        });

        it('El endpoint DELETE /api/cart/:cid debe vaciar el carrito de forma correcta', async () => {
            const user = {
                email: process.env.ADMIN_USER,
                password: process.env.ADMIN_PASS
            };

            // Realizar la autenticación y obtener la cookie
            const loginResponse = await requester.post('/api/sessions/login').send(user);
            const cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc1230',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await requester
                .post('/api/products')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado
                .send(productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const newUser = {
                email: 'test5@test.com',
                password: '123'
            };

            await requester.post('/api/sessions/register').send(newUser);

            const loginResponseUser = await requester.post('/api/sessions/login').send(newUser);
            const cookieUser = loginResponseUser.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.ok).to.equal(true);
            expect(updatedCart.body).to.have.property('_id');
            expect(Array.isArray(updatedCart.body.products)).to.be.ok;
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok, body } = await requester
                .delete(`/api/cart/${cid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(204);
            expect(ok).to.equal(true);
        });
    });
});
