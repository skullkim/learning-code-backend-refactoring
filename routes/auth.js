const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const {jsonResponse, jsonErrorResponse, RESPONSE_ENUM} = require('../lib/jsonResponse');

const router = express.Router();

router.post('/login', async (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if(err) {
            return next(err);
        }
        if(!user) {
            res.setHeader('Content-Type', 'application/vnd.api+json');
            res.status(401);
            return res.json(jsonErrorResponse(req, RESPONSE_ENUM.UNAUTHORIZED, 401, 'Unauthorized'));
        }
        const {name, email, login_as, api_id, profile_img_key} = user;
        const tokenData = {
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
            res.json(jsonResponse(req, {token}));
        })
    })(req, res, next);
});

module.exports = router;