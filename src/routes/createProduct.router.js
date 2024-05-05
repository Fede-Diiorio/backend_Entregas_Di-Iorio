const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const { verifyToken } = require('../utils/jwt');
const router = Router(); // Crea un enrutador

router.get('/', verifyToken, async (req, res) => {
    const isLoggedIn = req.cookies.accessToken !== undefined;
    const adminUser = req.user.rol;
    if (adminUser !== 'admin') {
        return res.render('error', {
            titlePage: 'Error',
            message: 'No tiene permisos de acceso.',
            style: ['styles.css'],
            isLoggedIn
        });
    }

    res.render('createProduct', {
        titlePage: 'Agregar Producto',
        style: ['styles.css'],
        script: ['createProduct.js'],
        isLoggedIn
    });
});

router.post('/', async (req, res) => {
    try {

        // Obtener los datos del producto del cuerpo de la solicitud
        const { title, description, price, thumbnail, code, status, stock } = req.body;

        // Agregar el nuevo producto al archivo
        const productManager = req.app.get('productManager');
        await productManager.addProduct(title, description, price, thumbnail, code, status, stock);

        res.status(301).redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

module.exports = router;