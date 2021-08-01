const express = require('express');

const {jsonResponse} = require('../lib/jsonResponse');

const router = express.Router();

router.get('/main-page-images', async (req, res, next) => {
    try{
        const resData = [
            {
                img_url: process.env.MAIN_LOGO_KEY
            },
            {
              img_url: process.env.MAIN_IMG2
            },
            {
                img_url: process.env.MAIN_IMG3
            }
        ];
        res.setHeader('Content-Type', 'application/vnd.api+json');
        res.status(200);
        res.json(jsonResponse(req, resData));
    }
    catch(err){
        console.error(err);
    }
});

module.exports = router;