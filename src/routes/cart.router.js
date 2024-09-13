import { Router } from 'express';
import Controller from '../controller/cart.controller.js';
import { isUser, isAdmin } from '../middlewares/auth.middleware.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';

const router = Router(); // Crea un enrutador

// Ruta para obtener todos los carritos
router.get('/', (req, res) => new Controller().getCarts(req, res));

// Ruta para obtener un carrito por su ID
router.get('/:cid', (req, res) => new Controller().getCartById(req, res));

// Ruta para agregar un nuevo carrito
router.post('/', verifyToken, isAdmin, (req, res) => new Controller().createCart(req, res));

// Ruta para agregar un producto a un carrito
router.post('/:cid/product/:pid', verifyToken, isUser, (req, res) => new Controller().addProductToCart(req, res));

// Ruta para agregar o actualizar productos del carrito
router.put('/:cid', verifyToken, isUser, (req, res) => new Controller().updateCart(req, res));

// Ruta para eliminar un producto del carrito
router.delete('/:cid/product/:pid', verifyToken, isUser, async (req, res) => new Controller().deleteProductFromCart(req, res));

// Ruta para atualizar la cantidad de un producto en el carrito
router.put('/:cid/product/:pid', verifyToken, isUser, (req, res) => new Controller().updateProductQuantity(req, res));

// Ruta para vacial el carrito
router.delete('/:cid', verifyToken, isUser, async (req, res) => new Controller().clearCart(req, res));

//Ruta para generar el comprobante de compra 
router.post('/:cid/purchase', verifyToken, isUser, async (req, res) => new Controller().generateTicket(req, res));

export default router; // Exporta el enrutador
