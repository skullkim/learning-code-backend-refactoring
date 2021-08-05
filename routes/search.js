const express = require('express');
const Op = require('sequelize').Op;
const axios = require('axios');

const Posting = require('../models/postings');
const Tag = require('../models/Tag');
const {jsonResponse, jsonErrorResponse} = require('../lib/jsonResponse');

const router = express.Router();

router.get('/:target', async (req, res, next) => {
    const {target} = req.params;
    if(target === 'title') {
        try{
            const {query} = req.query;
            const written = await Posting.findAll({
                where: {title: {[Op.like]: `%${query}%`}},
            });
            if(written.length) {
                res.contentType('application/vnd.api+json');
                res.status(200);
                return res.json(jsonResponse(req, written));
            }
        }
        catch(err){
            console.error(err);
            next(err);
        }
    }
    else if(target === 'category') {
        try{
            const {query} = req.query;
            if(query !== '도서 추천'){
                const written = await Posting.findAll({
                    where: {main_category: {[Op.like]: `%${query}%`}},
                });
                if(written.length){
                    console.log('posting' + written);
                    res.contentType('application/vnd.api+json');
                    res.status(200);
                    return res.json(jsonResponse(req, written));
                }
                const tag = await Tag.findOne({
                    where: {tag: {[Op.like]: `%${query}%`}},
                });
                console.log(tag);
                if(tag) {
                    const tagResult = await tag.getPostings();
                    console.log('tag' + tagResult);
                    res.contentType('application/vnd.api+json');
                    res.status(200);
                    return res.json(jsonResponse(req, tagResult));
                }
            }
            else{
                const books = await findBook(null);
                res.contentType('application/vnd.api+json');
                res.status(400);
                return res.json(jsonResponse(req, books));
            }
        }
        catch(err){
            console.error(err);
            next(err);
        }

    }
    else if(target === 'book') {
        try{
            const {query} = req.query;
            const books = await findBook(query);
            console.log(books);
            if(books.length) {
                res.contentType('application/vnd.api+json');
                res.status(200);
                return res.json(jsonResponse(req, books));
            }
        }
        catch(err){
            console.error(err);
            next(err);
        }
    }
    else {
        res.contentType('application/vnd.api+json');
        res.status(400);
        return res.json(jsonErrorResponse(req, {message: 'incorrect target'}));
    }
    res.contentType('application/vnd.api+json');
    res.status(200);
    return res.json(jsonResponse(req, {message: 'no such result'}));
});

const findBook = async (target) => {
    const title =  target || '프로그래밍';
    const result = await axios({
        method: 'GET',
        url: `https://dapi.kakao.com/v3/search/book?target=title`,
        headers: {Authorization: `KakaoAK ${process.env.KAKAO_CLIENT_ID}`},
        params: {
            query: `${title}`,
        },
    });
    return result.data.documents;
}

module.exports = router;