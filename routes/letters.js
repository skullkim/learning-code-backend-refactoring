const express = require('express');
const fs = require('fs');
const util = require('util');
const path = require('path');

const Posting = require('../models/postings');
const {jsonResponse} = require('../lib/jsonResponse');

const router = express.Router();

router.get('/', async(req, res, next) => {
    try {
       const postings = await Posting.findAll();
        res.setHeader('Content-Type', 'application/vnd.api+json');
        res.status(200);
        res.json(jsonResponse(req, postings));
    }
    catch(err) {
        next(err);
    }
})

router.get('/categories', async (req, res, next) => {
    try {
       const readFile = util.promisify(fs.readFile);
       const categories = await readFile(path.join(__dirname, '../lib/category.json'));
       res.setHeader('Content-Type', 'application/vnd.api+json');
       res.status(200);
       const res_data = JSON.parse(categories);
       res.json(jsonResponse(req, res_data));
    }
    catch(err) {
        next(err);
    }
});

module.exports = router;