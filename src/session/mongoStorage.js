import session from 'express-session';
import defaultOptions from './defaultOptions.js';
import MongoStore from 'connect-mongo';
import config from '../dbconfig.js';

const { mongoUrl, dbName } = config;

const storage = MongoStore.create({
    dbName,
    mongoUrl,
    ttl: 60 * 10
})

export default session({
    store: storage,
    ...defaultOptions
});
