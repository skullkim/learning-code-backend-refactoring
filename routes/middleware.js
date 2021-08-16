const jwt = require('jsonwebtoken');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');

const {jsonErrorResponse} = require('../lib/jsonResponse');

exports.verifyToken = async (req, res, next) => {
    try {
        const {cookie} = req.headers;
        const token = cookie.split('=')[1];
        req.decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.data = req.decoded.data;
        next();
    }
    catch(err) {
        if(err.name === 'TokenExpiredError') {
            res.setHeader('Content-Type', 'application/vnd.api+json');
            res.status(403);
            return res.json(jsonErrorResponse(req, {message: 'token expired'}, 403, 'Forbidden'));
        }
        res.setHeader('Content-Type', 'application/vnd.api+json');
        res.status(401);
        return res.json(jsonErrorResponse(req, {message: 'invalid token'}, 401, 'Unauthorized'));
    }
};

exports.uploadProfileImage = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: `${process.env.AWS_S3_BUCKET}`,
        key(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, `upload/posting/${path.basename(file.originalname, ext) + Date.now()} + ext`);
        }
    })
});

exports.uploadPostingImages = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: `${process.env.AWS_S3_BUCKET}`,
        key(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, `upload/posting/${path.basename(file.originalname, ext) + Date.now() + ext}`);
        }
    })
});