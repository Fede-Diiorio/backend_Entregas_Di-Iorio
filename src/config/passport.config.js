const passport = require('passport');
const UserManager = require('../dao/mongo/users.dao');
const { localStrategy, githubStrategy, jwtStrategy } = require('./strategies');

const initializeStrategy = () => {

    localStrategy();
    githubStrategy();
    jwtStrategy();

    passport.serializeUser((user, done) => {
        console.log('Serailized: ', user);
        done(null, user._id);
    })

    passport.deserializeUser(async (id, done) => {
        console.log('Deserialized: ', id)
        const user = await new UserManager().getUser(id);
        done(null, user)
    })
}

module.exports = initializeStrategy;
// const passport = require('passport');
// const { UserRepository } = require('../repository/user.repository');
// const { localStrategy, githubStrategy, jwtStrategy } = require('./strategies');

// const initializeStrategy = () => {

//     localStrategy();
//     githubStrategy();
//     jwtStrategy();

//     passport.serializeUser((user, done) => {
//         console.log('Serailized: ', user);
//         done(null, user._id);
//     })

//     passport.deserializeUser(async (id, done) => {
//         try {
//             const user = await new UserRepository().findById(id);
//             console.log('Deserialized: ', id)
//             done(null, user);
//         } catch (e) {
//             done(e, null);
//         }
//     })
// }

// module.exports = initializeStrategy;
