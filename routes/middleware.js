const jwt = require('jsonwebtoken');

const {jsonErrorResponse, RESPONSE_ENUM} = require('../lib/jsonResponse');

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
            return res.json(jsonErrorResponse(req, RESPONSE_ENUM[4], 403, 'Forbidden'));
        }
        res.setHeader('Content-Type', 'application/vnd.api+json');
        res.status(401);
        return res.json(jsonErrorResponse(req, RESPONSE_ENUM[3], 401, 'Unauthorized'));
    }
}