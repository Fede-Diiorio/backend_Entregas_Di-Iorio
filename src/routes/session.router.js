import 'dotenv/config';
import { Router } from 'express';
import passport from 'passport';
import Controller from '../controller/sessions.controller.js';
import { verifyToken, verifyPasswordToken } from '../middlewares/jwt.middleware.js';
import { isSuperAdmin, isAdmin, isUser } from '../middlewares/auth.middleware.js';
import { documentUploader, profileUploader } from '../utils/multerUploader.js';
import { multerErrorHandler } from '../middlewares/multerErrorHandler.middleware.js';

const router = Router(); // Crea un enrutador

router.post('/register', async (req, res) => new Controller().registerUser(req, res));

router.post('/login', async (req, res) => new Controller().loginUser(req, res));

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => new Controller().current(req, res));

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/githubcallback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), (req, res) => new Controller().githubCb(req, res));

router.post('/resetPassword', async (req, res) => new Controller().sendMailToResetPassword(req, res));

router.post('/resetPassword/:tid', verifyPasswordToken, async (req, res) => new Controller().resetPassword(req, res));

router.get('/logout', verifyToken, async (req, res) => new Controller().logout(req, res));

router.delete('/deleteUser', verifyToken, isSuperAdmin, (req, res) => new Controller().deleteUser(req, res));

router.post('/premium/:uid', verifyToken, async (req, res) => new Controller().changeRole(req, res));

router.post('/:uid/documents', verifyToken, documentUploader.fields([
    { name: 'identification', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'proofOfAccount', maxCount: 1 },
]), multerErrorHandler, async (req, res) => new Controller().uploadDocuments(req, res));

router.post('/picture', verifyToken, isUser, profileUploader.single('profilePicture'), async (req, res) => new Controller().updatePicture(req, res));

router.get('/', verifyToken, isAdmin, async (req, res) => new Controller().getUsers(req, res));

router.delete('/', verifyToken, isAdmin, async (req, res) => new Controller().deleteUsers(req, res));

export default router;