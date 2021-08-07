const express = require('express');
const {toJson, fromJson} = require('flatted');

const User = require('../models/users');
const Tag = require('../models/Tag');
const PostingImages = require('../models/postingImage');
const Posting = require('../models/postings');
const {jsonResponse} = require('../lib/jsonResponse');

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
        const responseData = {
            "main_data": posting.dataValues,
            "tags" : tag_arr,
            "posting_id" : posting.id,
            "images": imgs,
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

const circularStructureToJson = () => {
    const visited = new WeakSet();
    return (key, value) => {
        if(typeof value === 'object' && value !== null) {
            if(visited.has(value)) return;
            visited.add(value);
        }
        return value;
    };
};

module.exports = router;
