const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser')

// MANAGERS
const ProductManager = require('./dao/dbManagers/ProductManager');
const CartManager = require('./dao/dbManagers/CartManager');
const UserManager = require('./dao/dbManagers/UserManager');

// ROUTERS
const productsRouter = require('./routes/products.router');
const productsViewsRouter = require('./routes/productsViews.router');
const cartRouter = require('./routes/cart.router');
const cartViewsRouter = require('./routes/cartViews.router');
const createProductRouter = require('./routes/createProduct.router');
const sessionRouter = require('./routes/session.router');
const sessionViewsRouter = require('./routes/sessionViews.router');

const app = express();

// configurar handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

// Permitir envío de información mediante formularios y JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos de formularios
app.use(express.json()); // Middleware para parsear datos JSON
app.use(express.static(`${__dirname}/../public`))

    ;
const initializeStrategyAll = require('./config/passportAllConfig.config');
const { dbName, mongoUrl } = require('./dbconfig');
const sessionMiddleware = require('./session/mongoStorage');
app.use(sessionMiddleware);
initializeStrategyAll();
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser())

// ENDPOINTS
app.use('/api/products', productsRouter);
app.use('/products', productsViewsRouter);
app.use('/api/cart', cartRouter);
app.use('/cart', cartViewsRouter);
app.use('/createProduct', createProductRouter);
app.use('/api/sessions', sessionRouter);
app.use('/', sessionViewsRouter);

// Se inicia el servidor en el puerto 8080
const main = async () => {

    await mongoose.connect(mongoUrl, { dbName });

    const productManager = new ProductManager();
    await productManager.prepare();
    app.set('productManager', productManager);

    const cartManager = new CartManager();
    await cartManager.prepare();
    app.set('cartManager', cartManager);

    const userManager = new UserManager();
    await userManager.prepare();
    app.set('userManager', userManager);

    app.listen(8080);

    console.log('Servidor cargado!' + '\n' + 'http://localhost:8080')
}

main();
