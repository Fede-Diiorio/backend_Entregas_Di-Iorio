import 'dotenv/config';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt'

const cookieExtractor = req => req && req.cookies ? req.cookies['accessToken'] : null;

export const jwtStrategy = () => {

    passport.use('current', new Strategy({ secretOrKey: process.env.JWT_SECRET, jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]) },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (e) {
                done(e);
            };
        },
    ));
};