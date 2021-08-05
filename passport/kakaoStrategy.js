const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
const AWS = require('aws-sdk');
const axios = require('axios');

const User = require('../models/users');
const Token = require('../models/Token');

module.exports = () => {
    passport.use(new kakaoStrategy({
        clientID: process.env.KAKAO_CLIENT_ID,
        callbackURL: process.env.KAKAO_CALLBACKm
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const {id, username} = profile;
            const login_as = 'kakao';
            const exUser = await User.findOne({
                where: {login_as, api_id: id},
            });
            const path = profile._json.properties.profile_image;
            const key = `upload/profile/kakao/kakao-profile-${Date.now()}.jpg`;
            axios.get(path, {
                headers: {Authorization: `Bearer ${accessToken}`},
                responseType: 'stream',
            })
                .then(async (response) => {
                    const s3 = new AWS.S3();
                    response.data.pipe(s3Stream.WriteStream(s3, {
                        Bucket: `${process.env.AWS_S3_BUCKET}`,
                        Key: key,
                    }));
                })
                .catch((err) => {
                    console.error(err);
                });
            let user, user_id;
            if(exUser){
                await User.update(
                    {
                        login_as,
                        name: `${username}`,
                        profile_key: `${key}`,
                    },
                    {where: {login_as, api_id: id}},
                );
                user = exUser;
                user_id = exUser.id;
            }
            else{
                const date = new Date();
                const new_user = await User.create({
                    name: username,
                    password: `${id}`,
                    email: `${date.getMilliseconds()}`,
                    login_as,
                    api_id: `${id}`,
                    profile_key: `${key}`,
                });
                user = new_user;
                user_id = new_user.id;
            }
            await Token.create(
                {
                    user: user_id,
                    kakao_access: accessToken,
                    kaka_refresh: refreshToken,
                }
            );
            done(null, user);
        }
        catch(err) {
            done(err);
        }
    }))
}