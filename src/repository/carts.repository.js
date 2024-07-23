const { CustomError } = require('../utils/errors/customErrors');
const { ErrorCodes } = require('../utils/errors/errorCodes');

class CartRepository {

    #cartDAO;
    #productDAO;

    constructor(CartDAO, ProductDAO) {
        this.#cartDAO = CartDAO;
        this.#productDAO = ProductDAO;
    }

    async #verifyCartExists(cartId) {
        try {
            const cart = await this.#cartDAO.getCartById(cartId);
            return cart;
        } catch {
            throw CustomError.createError({
                name: 'cartID inválido',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                message: 'El carrito no existe',
                code: ErrorCodes.UNDEFINED_CART,
                status: 404
            })
        }
    }

    async #verifyProductExists(productId) {
        try {
            const product = await this.#productDAO.getProductById(productId);
            return product;
        } catch {
            throw CustomError.createError({
                name: 'productID inválido',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                message: 'El producto no existe',
                code: ErrorCodes.UNDEFINED_PRODUCT,
                status: 404
            });
        }
    }

    async getCarts() {
        try {
            return await this.#cartDAO.getCarts();
        } catch {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Ocurrió un error al buscar los carritos en la base de datos',
                message: 'Error al obtener los carritos',
                code: ErrorCodes.DATABASE_ERROR,
                status: 500
            });
        }
    }

    async getCartById(id) {
        try {
            let cart = await this.#verifyCartExists(id);
            // Se verifica que no se hayan eliminado de la DB los productos cargados en el carrito
            const updatedCart = cart.products.filter(i => i.product !== null);
            if (updatedCart.lenght !== cart.products.length) {
                cart.products = updatedCart;
                await this.#cartDAO.updateCart(id, { products: cart.products })
            }

            return cart;
        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Al parecer el carrito existe pero no se puede acceder al mismo',
                message: 'Error al obtener el carrito',
                code: ErrorCodes.UNDEFINED_CART,
                otherProblems: error,
                status: error.status || 500
            });
        }
    }

    async addCart() {
        try {
            const cart = { products: [] }
            return await this.#cartDAO.addCart(cart);
        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al generar un nuevo carrito en la base de datos',
                message: 'Error al crear un nuevo carrito',
                code: ErrorCodes.CART_CREATE_ERROR,
                otherProblems: error,
                status: error.status || 500
            });
        }

    }

    async addProductToCart(productId, cartId, user) {

        const product = await this.#verifyProductExists(productId);
        const cart = await this.#verifyCartExists(cartId);
        if (product.owner && product.owner === user.email) {
            throw CustomError.createError({
                name: 'Permiso denegado',
                cause: 'No puede agregar al carrito productos que están creados por el mismo usuario que está utilizando',
                message: 'Error al agregar el producto al carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                status: 403
            });
        }
        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
        if (existingProductIndex !== -1) {
            // Si el producto existe, aumentar su cantidad en 1
            cart.products[existingProductIndex].quantity += 1;
        } else {
            // Si el producto no existe, agregarlo al carrito con cantidad 1
            cart.products.push({ product: productId, quantity: 1 });
        }

        // Guardar el carrito actualizado
        await this.#cartDAO.updateCart(cartId, { products: cart.products });

        return cart;

    }

    async deleteProductFromCart(productId, cartId) {
        try {
            await this.#verifyProductExists(productId);
            await this.#verifyCartExists(cartId);
            await this.#cartDAO.updateCart(cartId, { products: { product: productId } }, '$pull');
            const cart = this.getCartById(cartId);
            return cart;
        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'No se pudo realizar la actualizacion del carrito en la base de datos y, por este motivo, el producto no pudo ser eliminado',
                message: 'Error al eliminar el producto del carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error,
                status: error.status || 500
            });
        }
    }

    async updateCart(cartId, products) {
        try {
            const cart = await this.#verifyCartExists(cartId);

            // Iterar sobre cada producto en el arreglo de productos
            for (const { product: productId, quantity } of products) {
                await this.#verifyProductExists(productId);

                if (quantity < 1 || isNaN(quantity)) {
                    throw CustomError.createError({
                        name: 'Error en la petición',
                        cause: 'La cantidad ingresada debe ser un número válido mayor a 0',
                        message: 'Petición rechazada por catidad inválida',
                        code: ErrorCodes.CART_UPDATE_ERROR,
                        status: 400
                    })
                }

                // Verificar si el producto ya está en el carrito
                const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
                if (existingProductIndex !== -1) {
                    // Si el producto ya está en el carrito, actualizar la cantidad
                    cart.products[existingProductIndex].quantity += quantity;
                } else {
                    // Si el producto no está en el carrito, agregarlo
                    cart.products.push({ product: productId, quantity });
                }
            }

            // Guardar los cambios en el carrito utilizando el DAO
            await this.#cartDAO.updateCart(cartId, { products: cart.products });
            const updatedCart = await this.#cartDAO.getCartById(cartId);
            return updatedCart;
        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema alctualizar el carrito en la base de datos.',
                message: 'Error al actualizar el carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error,
                status: error.status || 500
            });
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            await this.#verifyProductExists(productId);
            const cart = await this.#verifyCartExists(cartId);

            if (quantity < 0 || isNaN(quantity)) {
                throw CustomError.createError({
                    name: 'Cantidad inválida',
                    cause: `El valor ingresado es ${quantity} y debe ingresar un número válido mayor a 0`,
                    message: 'Debe ingresar un número válido mayor a 0',
                    code: ErrorCodes.INVALID_QUANTITY,
                    status: 400
                })
            }

            const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity = quantity;
                await this.#cartDAO.updateCart(cartId, { products: cart.products });
            }
            return cart;
        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema alctualizar la cantidad de unidades del producto en el carrito.',
                message: 'Error al actualizar el producto del carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error,
                status: error.status || 500
            });
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await this.#verifyCartExists(cartId);
            await this.#cartDAO.updateCart(cartId, { products: [] });
            return cart;

        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema alctualizar el carrito y no se pudo vaciar',
                message: 'Error al vaciar el carrito',
                code: ErrorCodes.CART_CLEAR_ERROR,
                otherProblems: error,
                status: error.status || 500
            });
        }
    }
}

module.exports = { CartRepository };
