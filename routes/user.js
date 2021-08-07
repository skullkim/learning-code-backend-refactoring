const express = require('express');

const {verifyToken} = require('./middleware');
const {jsonResponse} = require('../lib/jsonResponse');
const Posting = require('../models/postings');
const Comment = require('../models/comments');

const router = express.Router();

router.get('/profile/:userId', verifyToken, async (req, res, next) => {
    try {
        const {userId} = req.params;
        const {name} = req.decoded;
        const postings = await Posting.findAll({
            where: {author: userId}
        });
        const comments = await Comment.findAll({
            where: {commenter_id: userId}
        });
        const resPostings = postings.map(({dataValues:{title, main_category}}) => (
            {title, main_category}
        ));
        const resComments = comments.map(({dataValues:{comment}}) => ({comment}));
        const responseData = {
            name,
            postings: resPostings,
            comments: resComments
        };
        res.json(jsonResponse(req, responseData));
    }
    catch(err) {
        next(err);
    }
});

module.exports = router;