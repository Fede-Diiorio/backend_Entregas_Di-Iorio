import TicketDAO from '../dao/mongo/ticket.dao.js';
import ProductDAO from '../dao/mongo/products.dao.js';
import UserDAO from '../dao/mongo/users.dao.js';
import CartRepository from './carts.repository.js';
import CustomError from '../utils/errors/customErrors.js';
import { ErrorCodes } from '../utils/errors/errorCodes.js';
import MailingService from '../utils/mailingService.js';

export default class TicketRepository {

    #ticketDAO;
    #productDAO;
    #cartRepository;
    #userDAO;

    constructor() {
        this.#ticketDAO = new TicketDAO();
        this.#productDAO = new ProductDAO();
        this.#cartRepository = new CartRepository();
        this.#userDAO = new UserDAO();
    };

    #generateUniqueCode() {
        return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    };

    async #findCartById(cartId) {
        try {
            const cart = await this.#cartRepository.getCartById(cartId);

            return cart;

        } catch {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                message: 'El ID ingresado no corresponde a ningún carrito',
                code: ErrorCodes.UNDEFINED_CART,
                status: 404
            });
        };
    };

    async generateTicket(cartId, userEmail) {
        try {
            const cart = await this.#findCartById(cartId);

            let totalAmount = 0;

            for (const item of cart.products) {
                const product = await this.#productDAO.getProductById(item.product);
                if (product.stock < item.quantity) {
                    throw CustomError.createError({
                        name: 'Error con el stock',
                        cause: `No hay suficiente stock para el producto con ID ${product._id}`,
                        message: 'No se pudo completar la operación por falta de stock',
                        code: ErrorCodes.INSUFFICIENT_STOCK,
                        status: 400
                    });
                };
            };

            for (const item of cart.products) {
                const product = await this.#productDAO.getProductById(item.product);
                product.stock -= item.quantity;
                totalAmount += product.price * item.quantity;

                await this.#productDAO.updateProduct(product._id, { stock: product.stock });

                if (product.stock === 0) {
                    await this.#productDAO.updateProduct(product._id, { status: false });
                };
            };

            const ticketData = {
                code: this.#generateUniqueCode(),
                amount: totalAmount,
                purchaser: userEmail
            };

            const user = await this.#userDAO.findByEmail(userEmail);

            await new MailingService().buyNotification(user.email, user.firstName, user.lastName, ticketData.code, ticketData.amount);

            const ticket = await this.#ticketDAO.addTicket(ticketData);

            await this.#cartRepository.clearCart(cartId)

            return ticket;

        } catch (error) {
            throw CustomError.createError({
                name: error.name || 'Error al generar el ticket',
                cause: error.cause || 'Ocurrió un error a la hora de generar su ticket de compra',
                message: error.message || 'No se pudo generar su ticket',
                code: error.code || ErrorCodes.TICKET_CREATION_ERROR,
                status: error.status || 500
            });
        };
    };
};