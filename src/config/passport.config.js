const passport = require('passport');
const { UserRepository } = require('../repository/user.repository');
const { githubStrategy, jwtStrategy } = require('./strategies');

const initializeStrategy = () => {

    githubStrategy();
    jwtStrategy();

    passport.serializeUser((user, done) => {
        console.log('Serailized: ', user);
        done(null, user._id);
    })

    passport.deserializeUser(async (id, done) => {
        console.log('Deserialized: ', id)
        const user = await new UserRepository().getUserById(id);
        done(null, user)
    })
}

module.exports = initializeStrategy;
