export default class CustomError {
    static createError({
        name = 'Error',
        cause,
        message,
        code = 1,
        status

    }) {
        const error = new Error(message);
        error.name = name;
        error.cause = cause;
        error.code = code;
        error.status = status;
        return error;
    };
};