import 'dotenv/config';

export default {
    dbName: process.env.MONGO_DBNAME,
    mongoUrl: process.env.MONGO_URL
};
