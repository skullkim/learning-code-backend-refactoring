const jwt = require('jsonwebtoken');

const generateAccessToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, {expiresIn: '60m'});
}

module.exports = generateAccessToken;