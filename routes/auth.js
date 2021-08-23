const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {jsonResponse, jsonErrorResponse} = require('../lib/jsonResponse');
const generateAccessToken = require('../lib/generateAccessToken');
const {verifyToken} = require('./middleware');
const User = require('../models/users');
const Token = require('../models/Token');

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
        req.login(user, {session: false}, async (loginError) => {
            if(loginError) {
                next(loginError);
            }
            //const token = jwt.sign(tokenData, process.env.JWT_SECRET, {expiresIn: "60m"});
            const accessToken = generateAccessToken(tokenData);
            const refreshToken = jwt.sign(tokenData, process.env.JWT_REFRESH_SECRET);
            await Token.create({
                user_id: id,
                local_refresh: refreshToken,
            });
            res.setHeader('Content-Type', 'application/vnd.api+json');
            res.cookie('learningCodeRefreshJwt', refreshToken, {httpOnly: true});
            res.json(jsonResponse(req, {user_id: id, accessToken}));
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

router.post('/token', async (req, res, next) => {
    try {
        const {cookie} = req.headers;
        const userRefreshToken = cookie.split('=')[1];
        if(!userRefreshToken) {
            res.setHeader('Content-Type', 'application/vnd.api+json');
            res.status(401);
            return res.json(jsonErrorResponse(req, {message: 'invalid token'}, 401, 'Unauthorized'));
        }
        const dbRefreshToken = await Token.findOne({
            where: {local_refresh: userRefreshToken},
        });
        if(!dbRefreshToken) {
            res.setHeader('Content-Type', 'application/vnd.api+json');
            res.status(403);
            return res.json(jsonErrorResponse(req, {message: 'token expired'}, 403, 'Forbidden'));
        }
        jwt.verify(userRefreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            res.setHeader('Content-Type', 'application/vnd.api+json');
            if(err) {
                res.status(403);
                return res.json(jsonErrorResponse(req, {message: 'token expired'}, 403, 'Forbidden'));
            }
            const accessToken = generateAccessToken(user);
            res.status(201);
            return res.json(jsonResponse(req, {access_token: accessToken}, 201, 'created'));
        })
    }
    catch(err) {
        next(err);
    }
})

router.delete('/logout', verifyToken, async (req, res, next) => {
   try {
       const {cookie} = req.headers;
       const refreshToken = cookie.split('=')[1];
       req.logOut();
       res.clearCookie('learningCodeRefreshJwt');
       await Token.destroy({
           where: {local_refresh: refreshToken},
       });
       res.status(204);
       res.end();
   }
   catch(err) {
       next(err);
   }
})

module.exports = router;