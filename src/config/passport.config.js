import passport from 'passport';
import UserRepository from '../repository/user.repository.js';
import { githubStrategy, jwtStrategy } from './strategies/index.js';

export const initializeStrategy = () => {

    githubStrategy();
    jwtStrategy();

    passport.serializeUser((user, done) => {
        console.log('Serailized: ', user);
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        console.log('Deserialized: ', id);
        const user = await new UserRepository().getUserById(id);
        done(null, user);
    });
};

