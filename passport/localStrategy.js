const passport = require('passport');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

const User = require('../models/users');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
           const exUser = await User.findOne({
               where: {email},
           }) ;
           if(!exUser) {
               return done(null, false, {message: 'Did not signup yet'});
           }
           else {
               const result = await bcrypt.compare(password, exUser.password);
               if(!result) {
                   return done(null, false, {message: 'wrong password'});
               }
               return done(null, exUser);
           }
        }
        catch(err) {
            done(err);
        }
    }))
}