const passport = require('passport');
const local = require('./localStrategy');
const jwt = require('./jwtStrategy');
const kakao = require('./kakaoStrategy');

module.exports = () => {
    local();
    jwt();
    kakao();
}