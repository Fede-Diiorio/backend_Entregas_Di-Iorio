// const mongoose = require('mongoose');
// const { CartRepository } = require('../../src/repository/carts.repository');
// const { ProductRepository } = require('../../src/repository/products.repository');

// describe('Testing Carts Repository', () => {
//     let chai;
//     let expect;
//     const cartRepository = new CartRepository();
//     const productRepository = new ProductRepository();
//     let connection = null;

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

//     it('El resultado del get debe ser un array', async () => {
//         const result = await cartRepository.getCarts();
//         expect(Array.isArray(result)).to.be.ok;
//     });

//     it('Se debe obtener un carrito según su ID', async () => {
//         const cart = await cartRepository.addCart();
//         const findedCart = await cartRepository.getCartById(cart._id);

//         expect(findedCart).to.be.ok;
//     });

//     it('Se debe crear el carrito con un array vacio de productos', async () => {
//         const result = await cartRepository.addCart();
//         expect(Array.isArray(result.products)).to.be.ok;
//     });

//     it('Se debe agregar un producto al arreglo de products del carrito', async () => {
//         const mockProduct = {
//             title: 'test',
//             description: 'Descripcion para el produdcto',
//             price: 200,
//             code: 'abc128',
//             stock: 20,
//             category: 'almacenamiento',
//         };

//         const newProduct = await productRepository.addProduct(mockProduct);
//         const cart = await cartRepository.addCart();
//         const result = await cartRepository.addProductToCart(newProduct.id, cart._id, 'test@test.com');
//         const updatedCart = await cartRepository.getCartById(cart._id);

//         expect(result).to.be.ok;
//         expect(updatedCart.products[0].product._id.toString()).to.be.equal(newProduct.id);
//     });

//     it('Se debe elminar el producto del carrito', async () => {
//         const mockProduct = {
//             title: 'test',
//             description: 'Descripcion para el produdcto',
//             price: 200,
//             code: 'abc129',
//             stock: 20,
//             category: 'almacenamiento',
//         };

//         const newProduct = await productRepository.addProduct(mockProduct);
//         const cart = await cartRepository.addCart();
//         const result = await cartRepository.addProductToCart(newProduct.id, cart._id, 'test@test.com');
//         const updatedCart = await cartRepository.getCartById(cart._id);

//         expect(result).to.be.ok;
//         expect(updatedCart.products[0].product._id.toString()).to.be.equal(newProduct.id);

//         const deleteProductCart = await cartRepository.deleteProductFromCart(newProduct.id, cart._id);

//         expect(deleteProductCart.products[0]).to.not.exist;
//     });

//     it('El carrito se actualiza de manera correcta', async () => {
//         const mockProduct1 = {
//             title: 'test',
//             description: 'Descripcion para el produdcto',
//             price: 200,
//             code: 'abc130',
//             stock: 20,
//             category: 'almacenamiento',
//         };

//         const mockProduct2 = {
//             title: 'test',
//             description: 'Descripcion para el produdcto',
//             price: 200,
//             code: 'abc131',
//             stock: 20,
//             category: 'almacenamiento',
//         };

//         const newProduct1 = await productRepository.addProduct(mockProduct1);
//         const newProduct2 = await productRepository.addProduct(mockProduct2);
//         const cart = await cartRepository.addCart();
//         const result = await cartRepository.updateCart(cart._id, [{ product: newProduct1.id, quantity: 10 }, { product: newProduct2.id, quantity: 5 }]);
//         const updatedCart = await cartRepository.getCartById(cart._id);

//         expect(result).to.be.ok;
//         expect(updatedCart.products[0].product._id.toString()).to.be.equal(newProduct1.id);
//         expect(updatedCart.products[1].product._id.toString()).to.be.equal(newProduct2.id);
//         expect(updatedCart.products[0].quantity).to.be.equal(10);
//         expect(updatedCart.products[1].quantity).to.be.equal(5);
//     });

//     it('La catidad del producto deseado se actualiza correctamente', async () => {
//         const mockProduct = {
//             title: 'test',
//             description: 'Descripcion para el produdcto',
//             price: 200,
//             code: 'abc132',
//             stock: 20,
//             category: 'almacenamiento',
//         };

//         const newProduct = await productRepository.addProduct(mockProduct);
//         const cart = await cartRepository.addCart();
//         const result = await cartRepository.addProductToCart(newProduct.id, cart._id, 'test@test.com');

//         expect(result).to.be.ok;
//         expect(result.products[0].quantity).to.be.equal(1);

//         const updateCart = await cartRepository.updateProductQuantity(cart._id, newProduct.id, 10);

//         expect(updateCart.products[0].quantity).to.be.equal(10);

//     });

//     it('Se debe vaciar el carrito y debe quedar el arreglo de productos vacio', async () => {
//         const mockProduct = {
//             title: 'test',
//             description: 'Descripcion para el produdcto',
//             price: 200,
//             code: 'abc133',
//             stock: 20,
//             category: 'almacenamiento',
//         };

//         const newProduct = await productRepository.addProduct(mockProduct);
//         const cart = await cartRepository.addCart();
//         const result = await cartRepository.addProductToCart(newProduct.id, cart._id, 'test@test.com');

//         expect(result).to.be.ok;
//         expect(result.products[0].quantity).to.be.equal(1);

//         const updateCart = await cartRepository.clearCart(cart._id);
//         const findedCart = await cartRepository.getCartById(cart._id);

//         expect(Array.isArray(updateCart.products)).to.be.ok;
//         expect(findedCart.products).to.deep.equal([]);
//     });
// });
