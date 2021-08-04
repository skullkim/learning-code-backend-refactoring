const jwt = require('jsonwebtoken');

const {jsonErrorReponse, RESPONSE_ENUM} = require('../lib/jsonResponse');

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.cookie.slice(4);
        req.decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.data = req.decoded.data;
        return next();
    }
    catch(err) {
        if(err.name === 'TokenExpiredError') {
            res.setHeader('Content-Type', 'application/vnd.api+json');
            res.status(403);
            return res.json(jsonErrorReponse(req, RESPONSE_ENUM[4], 403, 'Forbidden'));
        }
        res.setHeader('Content-Type', 'application/vnd.api+json');
        res.status(401);
        return res.json(jsonErrorReponse(req, RESPONSE_ENUM[3], 401, 'Unauthorized'));
    }
}