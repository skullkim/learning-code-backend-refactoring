const express = require('express');
const bcrypt = require('bcrypt');

const {verifyToken} = require('./middleware');
const {jsonResponse, jsonErrorResponse} = require('../lib/jsonResponse');
const Posting = require('../models/postings');
const Comment = require('../models/comments');
const User = require('../models/users');

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

router.put('/password/:userId', verifyToken, async(req, res, next) => {
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
})

module.exports = router;