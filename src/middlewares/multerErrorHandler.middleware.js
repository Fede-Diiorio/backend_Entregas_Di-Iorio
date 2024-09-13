import multer from 'multer';

export const multerErrorHandler = (err, _, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                name: 'MulterError',
                message: 'Campo de archivo inesperado. Verifique los campos permitidos.',
                status: 400,
            });
        };
        return res.status(400).json({
            name: 'MulterError',
            message: err.message,
            status: 400,
        });
    } else if (err) {
        return res.status(500).json({
            name: 'ServerError',
            message: 'Error interno del servidor',
            status: 500,
        });
    };
    next();
};
