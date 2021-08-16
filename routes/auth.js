const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {jsonResponse, jsonErrorResponse} = require('../lib/jsonResponse');
const User = require('../models/users');

const router = express.Router();

router.post('/login', async (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if(err) {
            return next(err);
        }
        if(!user) {
            res.setHeader('Content-Type', 'application/vnd.api+json');
            res.status(401);
            return res.json(jsonErrorResponse(req, {message: 'incorrect email or password'}, 401, 'Unauthorized'));
        }
        const {id, name, email, login_as, api_id, profile_img_key} = user;
        const tokenData = {
            id,
            name,
            email,
            login_as,
            api_id,
            profile_img_key
        };
        req.login(user, {session: false}, (loginError) => {
            if(loginError) {
                next(loginError);
            }
            const token = jwt.sign(tokenData, process.env.JWT_SECRET, {expiresIn: "60m"});
            res.setHeader('Content-Type', 'application/vnd.api+json');
            res.cookie('learningCodeJwt', token, {httpOnly: true});
            res.json(jsonResponse(req, {user_id: id, token}));
        })
    })(req, res, next);
});

router.post('/signup', async (req, res, next) => {
   try{
       const {name, password, email} = req.body;
       const exName = await User.findOne({
           where: {name},
       });
       const exEmail = await User.findOne({
           where: {email},
       });
       res.setHeader('Content-Type', 'application/vnd.api+json');
       if(exName || exEmail) {
           const error = exName ? 'same name exist' : 'same email exist';
           res.status(400);
           return res.json(jsonErrorResponse(req, {message: `${error}`}));
       }
       const bcryptPasswd = await bcrypt.hash(password, 12);
       const newUser = await User.create({
           name,
           password: bcryptPasswd,
           email,
       });
       if(newUser) {
           res.status(201);
           return res.json(jsonResponse(req, {message: 'success'}, 201, 'Created'));
       }
   }
   catch(err) {
       next(err);
   }
});

module.exports = router;