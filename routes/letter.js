const express = require('express');
const AWS = require('aws-sdk');
const {toJson, fromJson} = require('flatted');

const Comment = require('../models/comments');
const User = require('../models/users');
const Tag = require('../models/Tag');
const PostingImages = require('../models/postingImage');
const Posting = require('../models/postings');
const {jsonResponse} = require('../lib/jsonResponse');
const circularStructureToJson = require('../lib/circularJson');

const router = express.Router();

router.get('/:letterId', async (req, res, next) => {
    try {
        const {letterId} = req.params;
        const posting = await Posting.findOne({
            where: {id: letterId}
        });
        const tags = await posting.getTags();
        const tag_arr = new Array();
        tags.forEach((e) => {
            tag_arr.push(e.tag);
        });
        const imgs = await PostingImages.findAll({
            attributes: ['id'],
            where: {post_id: posting.id},
        });
        const id = posting.dataValues.author;
        const ex_user = await User.findOne({
            where: {id},
        });
        posting.dataValues.author = ex_user.name;
        const comments = await Comment.findAll({
            where: {posting_id: letterId}
        });
        const responseData = {
            "main_data": posting.dataValues,
            "tags" : tag_arr,
            "posting_id" : posting.id,
            "images": imgs,
            comments,
        };
        let circularJson = jsonResponse(req, responseData);
        JSON.stringify(circularJson, circularStructureToJson());
        res.setHeader('Content-Type', 'application/vnd.api+json');
        res.status(200);
        res.json(circularJson);
    }
    catch(err) {
        next(err);
    }
});

router.get('/:letterId/images/:imageId', async (req, res, next) => {
    try {
        const {letterId, imageId} = req.params;
        const s3Key = await PostingImages.findOne({
            attributes: ['img_key'],
            where: {id: imageId},
        });
        const s3 = new AWS.S3();
        s3.getObject({
            Bucket: `${process.env.AWS_S3_BUCKET}`,
            Key: `${s3Key.img_key}`,
        }, (err, data) => {
            if(err) {
                console.log(err);
            }
            else{
                res.write(data.Body, 'binary');
                res.end(null, 'binary');
            }
        })
    }
    catch(err) {
        next(err);
    }
})

module.exports = router;
