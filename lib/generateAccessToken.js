const jwt = require('jsonwebtoken');

const generateAccessToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, {expiresIn: '10s'});
}

module.exports = generateAccessToken;