import multer from 'multer';
import path from 'path';

const productStorage = multer.diskStorage({

    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../../public/products');
        cb(null, dest);
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

export const productUploader = multer({ storage: productStorage });

const documentStorage = multer.diskStorage({

    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../../public/documents');
        cb(null, dest);
    },

    filename: function (req, file, cb) {
        const userId = req.params.uid;

        // Genera el nuevo nombre del archivo basado en el campo y el userId
        const fileExtension = path.extname(file.originalname); // Obtén la extensión del archivo
        const baseName = path.basename(file.originalname, fileExtension); // Obtén el nombre base sin extensión
        const newFileName = `${file.fieldname}-${userId}-${baseName}${fileExtension}`;

        cb(null, newFileName);
    },
});

export const documentUploader = multer({

    storage: documentStorage,

    fileFilter: function (req, file, cb) {
        const allowedFields = ['identification', 'proofOfAddress', 'proofOfAccount'];
        if (allowedFields.includes(file.fieldname)) {
            cb(null, true);
        } else {
            cb(new Error('Unexpected field'), false);
        };
    },
});

const profileStorage = multer.diskStorage({

    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../../public/profiles');
        cb(null, dest);

    },

    filename: function (req, file, cb) {
        const userId = req.user.id;

        // Genera el nuevo nombre del archivo basado en el campo y el userId
        const fileExtension = path.extname(file.originalname); // Obtén la extensión del archivo
        const baseName = path.basename(file.originalname, fileExtension); // Obtén el nombre base sin extensión
        const newFileName = `${file.fieldname}-${userId}-${baseName}${fileExtension}`;

        cb(null, newFileName);
    },
});

export const profileUploader = multer({

    storage: profileStorage,

    fileFilter: function (req, file, cb) {
        const allowdField = 'profilePicture';
        if (allowdField.includes(file.fieldname)) {
            cb(null, true);
        } else {
            cb(new Error('Unexpected field'), false);
        };
    },
});