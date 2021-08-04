const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const dotenv = require('dotenv');

const User = require('../models/users');

dotenv.config();

module.exports = () => {
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }, async (jwtPayload, done) => {
        try{
            const user = await User.findOne({
                where:{id: jwtPayload.id},
            });
            done(null, user);
        }
        catch(err) {
            done(err);
        }
    }))
}