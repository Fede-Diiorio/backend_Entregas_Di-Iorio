require('dotenv').config();

module.exports = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
}