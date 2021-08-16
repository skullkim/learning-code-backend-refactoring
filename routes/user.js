const express = require('express');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const Op = require('sequelize').Op;

const {AwsConfig} = require('../lib/awsConfig');
const {verifyToken, uploadProfileImage, uploadPostingImages} = require('./middleware');
const {jsonResponse, jsonErrorResponse} = require('../lib/jsonResponse');
const {getCategories} = require('../lib/category');
const Posting = require('../models/postings');
const Comment = require('../models/comments');
const User = require('../models/users');
const PostingImage = require('../models/postingImage');
const Tag = require('../models/Tag');

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
});

router.post('/:userId/posting/:postingId/comment', verifyToken, async (req, res, next) => {
   try {
      const {postingId} = req.params;
      const {comment} = req.body;
      const {id, name} = req.decoded;
      await Comment.create({
          commenter_id: id,
          commenter: name,
          posting_id: postingId,
          comment,
      });
      res.contentType('application/vnd.api+json');
      res.status(201);
      res.json(jsonResponse(req, {message: 'success'}, 201, 'created'));
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

router.put('/:userId/posting/:postingId', verifyToken, uploadPostingImages.array('imgs'), async (req, res, next) => {
    try {
        const {userId, postingId} = req.params;
        const {title, posting, category, tags} = req.body;
        await Posting.update(
            {title, main_posting: posting, main_category: category},
            {where: {[Op.and]: [{id: postingId}, {author: userId}]}}
        );
        const exPosting = await Posting.findOne({
            where: {title}
        });
        const prevTags = await exPosting.getTags();
        if(prevTags && tags){
            await Promise.all(
                prevTags.map((tag) => {
                    exPosting.removeTag(tag.id);
                })
            );
            if(typeof tags === "object"){
                const result = await Promise.all(
                    tags.map((tag) => {
                        return Tag.create({
                            tag
                        });
                    })
                );
                await exPosting.addTags(result.map(r => r.id));
            }
            else{
                const result = await Tag.create({
                    tag: tags,
                });
                await exPosting.addTags(result);
            }
        }
        const images = req.files;
        if(images) {
            const prevImgs = await PostingImages.findAll({
                attributes: ['img_key'],
                where: {post_id: postingId},
            });
            const s3 = new AWS.S3();
            prevImgs.map((img) => {
                s3.deleteObject({
                    Bucket: `${process.env.AWS_S3_BUCKET}`,
                    Key: `${img.datavalues.img_key}`,
                }, (err, data) => {
                    err ? console.error(err) : console.log('delete image success');
                });
            });
            await PostingImages.destroy({
                where: {post_id: postingId},
            });
            await Promise.all(
                images.map((img) => {
                    PostingImages.create({
                        post_id: postingId,
                        img_key: img.key
                    });
                })
            );
        }
        res.contentType('application/vnd.api+json');
        res.status(201);
        res.json(jsonResponse(req, {message: 'success'}, 201, 'create'));
    }
    catch(err) {
        next(err);
    }
});

router.delete('/:userId/posting/:postingId', verifyToken, async (req, res, next) => {
    try {
        const {userId, postingId} = req.params;
        const {id} = req.decoded;
        const exPosting = await Posting.findOne({
            where: {
                [Op.and]: [
                    {author: id},
                    {id: postingId},
                ]
            }
        });
        if(!exPosting) {
            res.contentType('application/vnd.api+json');
            res.status(400);
            return res.json(jsonErrorResponse(req, {message: `posting doesn't exist`}, 400, 'Bad Request'));
        }
        const tags = await exPosting.getTags();
        if(tags) {
            await Promise.all(
                tags.map((tag) => exPosting.removeTag(tag.id))
            );
        }
        const postingImages = await PostingImage.findAll({
            where: {post_id: postingId},
        });
        if(postingImages) {
            await PostingImage.destroy({
                where: {post_id: id},
            });
        }
        await Comment.destroy({
            where: {posting_id: id},
        });
        await Posting.destroy({
            where: {
                [Op.and]: [
                    {author: id},
                    {id: postingId},
                ]
            }
        });
        res.contentType('application/vnd.api+json');
        res.status(200);
        return res.json(jsonResponse(req, {message: 'success'}));
    }
    catch(err) {
        next(err);
    }
});

router.post('/:userId/posting', verifyToken, uploadPostingImages.array('imgs'), async (req, res, next) => {
    try {
        const {id} = req.decoded;
        const {title, posting, category, tags} = req.body;
        const newPosting = await Posting.create({
            author: id,
            title,
            main_posting: posting,
            main_category: category,
        });
        const {dataValues: newPostingInfo} = newPosting;
        const images = req.files;
        if(images) {
            await Promise.all(
                images.map((img) => {
                    PostingImage.create({
                        post_id: newPostingInfo.id,
                        img_key: img.key,
                    });
                })
            );
        }
        if(tags) {
            if(typeof tags === 'object') {
                const result = await Promise.all(
                    tags.map(tag => {
                        return Tag.create({
                            tag,
                        });
                    })
                );
                await newPosting.addTags(result.map(r => r.id));
            }
            else {
                const result = await Tag.create({
                    tag: tags,
                });
                await newPosting.addTags(result);
            }
        }
        res.contentType('application/vnd.api+json');
        res.status(201);
        res.json(jsonResponse(req, {message: 'success'}, 201, 'created'));
    }
    catch(err) {
        next(err);
    }
});

module.exports = router;