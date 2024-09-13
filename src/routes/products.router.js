import { Router } from 'express';
import Controller from '../controller/products.controller.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';
import { isAdmin, isUserPremium } from '../middlewares/auth.middleware.js';
import { productUploader } from '../utils/multerUploader.js';

const router = Router(); // Crea un enrutador

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

export default router; // Exporta el enrutador
