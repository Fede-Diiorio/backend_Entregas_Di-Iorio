import 'dotenv/config';
import CustomError from '../utils/errors/customErrors.js';
import { ErrorCodes } from '../utils/errors/errorCodes.js';
import nodemailer from 'nodemailer';

export default class MailingService {

    async sendMail(email) {
        try {
            const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
            const baseUrl = process.env.BASE_URL;
            const port = process.env.PORT;
            const prodUrl = process.env.PROD_URL;
            const devLink = `${baseUrl}${port}/users/resetPassword/${randomNumber}`;
            const prodLink = `${prodUrl}users/resetPassword/${randomNumber}`;
            const currentUrl = process.env.LOGGER_ENV === 'production' ? prodLink : devLink;

            const transport = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.GOOGLE_MAIL,
                    pass: process.env.GOOGLE_PASS
                },
            });

            await transport.sendMail({
                from: 'Servicio Backend App',
                to: email,
                subject: 'BackendApp | Restablecer contraseña',
                html: `
            <div>
                <h2>Ingrese al link para poder restablecer su contraseña</h2>
                <h4>Tenga en cuenta que el link de restablecimiento tiene una duración de una hora. Si este plazo se vence deberá generar un nuevo link.</h4>
                <a href="${currentUrl}">Restablecer contraseña</a>
                <p>Código: ${randomNumber}</p>
            </div>`,
                attachments: []
            });

            return { randomNumber, email };

        } catch {
            throw CustomError.createError({
                name: 'Error al restablecer contraseña',
                cause: 'Ocurrió un error y no se pudo enviar el email al destinatario.',
                message: 'No se pudo enviar el email',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            });
        };
    };

    async sendDeletionNotification(email, firstName, lastName) {
        try {
            const transport = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.GOOGLE_MAIL,
                    pass: process.env.GOOGLE_PASS
                },
            });

            await transport.sendMail({
                from: 'Servicio Backend App',
                to: email,
                subject: 'BackendApp | Cuenta eliminada',
                html: `
            <div>
                <h2>Cuenta eliminada</h2>
                <h4>Estimado ${firstName} ${lastName}, por medio de la presente le informamos que su cuenta ha sido eliminada de nuestro servicio de Ecommerce debido a inactividad en la misma.</h4>
            </div>`,
                attachments: [],
            });

            return { email };

        } catch (error) {
            throw CustomError.createError({
                name: 'Error al notificar a los usuarios',
                cause: 'Ocurrió un error y no se pudieron enviar los emails a los destinatarios.',
                message: 'No se pudieron enviar los emails',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            });
        };
    };

    async sendNotificationOfProductRemoved(email, firstName, lastName, productName, productId) {
        try {
            const transport = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.GOOGLE_MAIL,
                    pass: process.env.GOOGLE_PASS
                },
            });

            await transport.sendMail({
                from: 'Servicio Backend App',
                to: email,
                subject: 'BackendApp | Producto eliminado',
                html: `
            <div>
                <h2>Cuenta eliminada</h2>
                <h4>Estimado ${firstName} ${lastName}, por medio de la presente le informamos que su producto ${productName} ID: ${productId} fue eliminado de nuestro servicio de Ecommerce.</h4>
            </div>`,
                attachments: [],
            });

            return { email };

        } catch (error) {
            throw CustomError.createError({
                name: 'Error al notificar a los usuarios',
                cause: 'Ocurrió un error y no se pudieron enviar los emails a los destinatarios.',
                message: 'No se pudieron enviar los emails',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            });
        };
    };

    async buyNotification(email, firstName, lastName, ticketId, amount) {
        try {
            const transport = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.GOOGLE_MAIL,
                    pass: process.env.GOOGLE_PASS
                },
            });

            await transport.sendMail({
                from: 'Servicio Backend App',
                to: email,
                subject: 'BackendApp | Compra Realizada',
                html: `
            <div>
                <h2>Cuenta eliminada</h2>
                <h4>Estimado ${firstName} ${lastName}, por medio de la presente le informamos que su comprá por un total de $${amount} ha sido aprobada. Su código de compra es: ${ticketId}</h4>
            </div>`,
                attachments: [],
            });

            return { email };

        } catch (error) {
            throw CustomError.createError({
                name: 'Error al notificar la compra',
                cause: 'Ocurrió un error y notificar al usuario de su compra',
                message: 'No se pudo enviar el email de notificación de la compra',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            });
        };
    };
};