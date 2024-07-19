const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, `${__dirname}/../../files`)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '__test')
    }
})

const uploader = multer({ storage });

module.exports = { uploader };