const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador
const { Controller } = require('../controller/products.controller');
const { verifyToken } = require('../middlewares/jwt.middleware');
const { isAdmin, isUserPremium } = require('../middlewares/auth.middleware');
const { productUploader } = require('../utils/multerUploader');

// Ruta para obtener todos los productos

router.get('/', (req, res) => new Controller().getProducts(req, res));

// Ruta para obtener todos los produtos y opciones de paginado
router.get('/paginate', (req, res) => new Controller().getPaginateProducts(req, res));

// Ruta para obtener un producto por su ID
router.get('/:pid', async (req, res) => new Controller().getProductById(req, res));

// Ruta para agregar un nuevo producto
router.post('/', verifyToken, isUserPremium, productUploader.single('thumbnail'), async (req, res) => new Controller().addProduct(req, res));

// Ruta para actualizar un producto por su ID
router.put('/:pid', verifyToken, isAdmin, async (req, res) => new Controller().updateProduct(req, res));

// Ruta para eliminar un producto por su ID
router.delete('/:pid', verifyToken, isUserPremium, async (req, res) => new Controller().deleteProduct(req, res));

module.exports = router; // Exporta el enrutador
