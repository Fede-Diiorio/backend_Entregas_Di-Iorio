import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { initializeStrategy } from './config/passport.config.js';
import config from './dbconfig.js';
import sessionMiddleware from './session/mongoStorage.js';
import { productRouter, cartRouter, sessionRouter } from './routes/index.js';
import { useLogger } from './middlewares/logger.middleware.js';
import helmet from 'helmet';
import swaggerJSDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const { dbName, mongoUrl } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Permitir envío de información mediante formularios y JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos de formularios
app.use(express.json()); // Middleware para parsear datos JSON
app.use(express.static(path.join(__dirname, '../public')));

app.use(helmet());
app.use(sessionMiddleware);
initializeStrategy();
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(useLogger);

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Ecommerce Coderhouse',
            description: 'API pensada para realizar todas las tareas requeridas por un ecommerce'
        }
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/apidocs', serve, setup(specs));

// ENDPOINTS
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/users', sessionRouter);

// Exportar la aplicación para las pruebas
export default app;

// Iniciar el servidor si se ejecuta directamente
const startServer = async () => {
    try {
        await mongoose.connect(mongoUrl, { dbName });

        const PORT = process.env.PORT || 8080;

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\nServidor cargado en el puerto ${PORT}\nDocumentación ↓\nhttp://localhost:${PORT}/apidocs`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    };
};

startServer();