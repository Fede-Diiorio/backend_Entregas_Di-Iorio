import 'dotenv/config';

export default {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
};