const express = require('express');
const {Op} = require('sequelize');

const User = require('../models/users');
const {jsonResponse} = require('../lib/jsonResponse');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try{
        //const {url, method, params, query, headers:{host, accept}} = req;
        const users = await User.findAll({
            where: {id: {[Op.gt]: 0}},
        });
        res.setHeader('Content-Type', 'application/vnd.api+json');
        res.status(200);
        res.json(jsonResponse(req, users));
    }
    catch(err){
        console.error(err);
    }
});

module.exports = router;