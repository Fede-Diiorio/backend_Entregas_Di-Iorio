require('dotenv').config(); // Carga las variables de entorno desde .env
const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador
const passport = require('passport');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/jwt');

router.use(cookieParser());

// router.post('/login', passport.authenticate('login2', { failureRedirect: '/api/sessions/faillogin' }), async (req, res) => {
//     try {
//         req.session.user = { email: req.user.email, _id: req.user._id.toString(), rol: req.user.rol, firstName: req.user.firstName, lastName: req.user.lastName, age: req.user.age }
//         const credentials = { id: req.user._id.toString(), email: req.user.email }
//         const accessToken = generateToken(credentials);
//         res.cookie('accessToken', accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true });
//         res.redirect('/');
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// });

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister', session: false }), (req, res) => {
    res.json({ message: 'Singup successfully', user: req.user });
});

router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err || !user) {
                console.log(err)
                const error = new Error('new Error')
                return next(error)
            }

            req.login(user, { session: false }, async (err) => {
                if (err) return next(err)
                const body = { _id: user._id, email: user.email }

                const token = jwt.sign({ user: body }, 'top_secret')
                return res.json({ token })
            })
        }
        catch (e) {
            return next(e)
        }
    })(req, res, next)
})

router.get('/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    return res.json(req.user)
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = { email: req.user.email, _id: req.user._id.toString(), rol: req.user.rol, firstName: req.user.firstName, lastName: req.user.lastName, age: req.user.age };
    res.redirect('/');
})

router.get('/faillogin', (_, res) => {
    res.send('Hubo un error de logeo.');
})

router.post('/resetPassword', passport.authenticate('resetPass', { failureRedirect: '/api/sessions/failogin' }), async (_, res) => {
    try {
        res.redirect('/');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(_ => {
        res.redirect('/');
    })
})



router.get('/failregister', (_, res) => {
    res.send('Hubo un error de registro.');
})

router.get('/faillogin', (_, res) => {
    res.send('Hubo un error de logeo.');
})

module.exports = router;
