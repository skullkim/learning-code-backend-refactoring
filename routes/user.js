const express = require('express');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const Op = require('sequelize').Op;

const {AwsConfig} = require('../lib/awsConfig');
const {verifyToken, uploadProfileImage} = require('./middleware');
const {jsonResponse, jsonErrorResponse} = require('../lib/jsonResponse');
const {getCategories} = require('../lib/category');
const Posting = require('../models/postings');
const Comment = require('../models/comments');
const User = require('../models/users');
const PostingImages = require('../models/postingImage');

const router = express.Router();

router.get('/:userId/profile', verifyToken, async (req, res, next) => {
    try {
        const {userId} = req.params;
        const {name} = req.decoded;
        const postings = await Posting.findAll({
            where: {author: userId}
        });
        const comments = await Comment.findAll({
            where: {commenter_id: userId}
        });
        const resPostings = postings.map(({dataValues:{id, title, main_category}}) => (
            {id, title, main_category}
        ));
        const resComments = comments.map(({dataValues:{id, comment}}) => ({id, comment}));
        const responseData = {
            name,
            profile_img: `/user/profile-image/${userId}`,
            postings: resPostings,
            comments: resComments
        };
        res.json(jsonResponse(req, responseData));
    }
    catch(err) {
        next(err);
    }
});

router.put('/:userId/profile', verifyToken, uploadProfileImage.single('profileImage'), async (req, res, next) => {
    try {
        const {id, login_as, profile_key} = req.decoded;
        const {name, email} = req.body;
        if(name) {
            const exName = await User.findOne({
                where: {name},
            });
            if(exName) {
                res.contentType('application/vnd.api+json');
                res.status(400);
                return res.json(jsonErrorResponse(req, {message: `same name exist`}));
            }
            await User.update(
                {name},
                {where: {id}}
            );
        }
        if(email) {
            const exEmail = await User.findOne({
                where: {email},
            });
            if(exEmail) {
                res.contentType('application/vnd.api+json');
                res.status(400);
                return res.json(jsonErrorResponse(req, {message: `same email exist`}));
            }
            await User.update(
                {email},
                {where: {id}}
            );
        }
        if(req.file) {
            const {location, key} = req.file;
            await User.update(
                {profile_key: `${key}`},
                {where: {id}}
            );
            const s3 = new AWS.S3();
            s3.deleteObject({
                Bucket: `${process.env.AWS_S3_BUCKET}`,
                Key: `${profile_key}`,
            }, (err, data) => {
                err ? console.error(err) : console.log('local profile image deleted');
            })
        }
        res.contentType('application/vnd.api+json');
        res.status(201);
        return res.json(jsonResponse(req, {message: 'success'}, 201, 'create'));
    }
    catch(err) {
        next(err);
    }
});

router.get('/:userId/profile-image', verifyToken, (req, res, next) => {
   const {profile_img_key} = req.decoded;
   const imgKey = profile_img_key || process.env.DEFAULT_PROFILE_IMG_KEY;
   const s3 = new AWS.S3();
   s3.getObject({
       Bucket: `${process.env.AWS_S3_BUCKET}`,
       Key: `${imgKey}`,
   }, (err, data) => {
       if(err) {
           next(err);
       }
       else {
           res.setHeader('Content-Type', 'image/png');
           res.write(data.Body, 'binary');
           res.end(null, 'binary');
           }
       });
});


router.put('/:userId/password', verifyToken, async(req, res, next) => {
    try{
       const {userId} = req.params;
       const {prevPassword, newPassword} = req.body;
       const exUser = await User.findOne({
           where: {id: userId}
       });
       const comparePassword = await bcrypt.compare(prevPassword, exUser.password);
       res.contentType('application/vnd.api+json');
       if(!comparePassword) {
          res.status(401);
          return res.json(jsonErrorResponse(req,
              {message: 'invalid password'},
              401,
              'Unauthorized'
          ));
       }
       const hashedPassword = await bcrypt.hash(newPassword, 12);
       await User.update(
           {password: hashedPassword},
           {where: {id: userId}}
       );
       res.status(201);
       return res.json(jsonResponse(req, {message: 'success'}, 201, 'created'));
    }
    catch(err) {
       next(err);
    }
});

router.put('/:userId/comment/:commentId', verifyToken, async (req, res, next) => {
    try {
       const {commentId} = req.params;
       const {newComment} = req.body;
       await Comment.update(
           {comment: newComment},
           {where: {id: commentId}}
       );
       res.contentType('application/vnd.api+json');
       res.status(201);
       res.json(jsonResponse(req, {message: 'success'}, 201, 'created'));
    }
    catch(err) {
        next(err);
    }
});

router.delete ('/:userId/comment/:commentId', verifyToken, async (req, res, next) => {
    try {
        const {userId, commentId} = req.params;
        await Comment.destroy({
            where: {[Op.and]: [
                    {id: commentId},
                    {commenter_id: userId},
                ]},
        });
        res.contentType('application/vnd.api+json');
        res.status(200);
        res.json(jsonResponse(req, {message: 'success'}));
    }
    catch(err) {
        next(err);
    }
})

router.get('/:userId/posting/:postingId', verifyToken, async (req, res, next) => {
    try {
        const {userId, postingId} = req.params;
        const posting = await Posting.findOne({
            where: {[Op.and]: [
                    {id: postingId},
                    {author: userId}
                ]},
        });
        const tags = await posting.getTags();
        const selectedTags = tags.map(({tag}) => tag);
        const images = await PostingImages.findAll({
            attributes: ['id'],
            where: {post_id: postingId}
        });
        const categories = getCategories();
        const resData = {
            posting,
            selectedTags,
            categories,
            images,
        }
        const circularJson = jsonResponse(req, resData);
        res.contentType('application/vnd.api+json');
        res.status(200);
        res.json(circularJson);
    }
    catch(err) {
        next(err);
    }
})

router.put()

module.exports = router;