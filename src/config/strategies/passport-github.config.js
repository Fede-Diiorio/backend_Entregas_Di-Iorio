import passport from 'passport';
import { Strategy } from 'passport-github2';
import { verifyToken } from '../../middlewares/jwt.middleware.js';
import config from '../github.private.js'
import UserRepository from '../../repository/user.repository.js';

const { clientID, clientSecret, callbackURL } = config;

export const githubStrategy = () => {

    passport.use('github', new Strategy({ clientID, clientSecret, callbackURL },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const { accessToken, user } = await new UserRepository().githubLogin(profile);

                verifyToken({ cookies: { accessToken } }, null, (err) => {
                    if (err) {
                        return done(err);
                    }

                    return done(null, { accessToken, user }, { message: 'Authentication successful' });
                });
            } catch (e) {
                done(e);
            };
        },
    ));
};