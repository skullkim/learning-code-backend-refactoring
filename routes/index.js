const express = require('express');
const {Op} = require('sequelize');

const User = require('../models/users');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try{
        const {url, method, params, query, headers:{host, accept}} = req;
        const users = await User.findAll({
            where: {id: {[Op.gt]: 0}},
        });
        res.setHeader('Content-Type', 'application/vnd.api+json');
        res.status(200);
        const res_json = {
            status: '200',
            statusText: 'OK',
            request: {
                url,
                method,
                headers: {
                    host,
                    accept
                },
                params,
                query,
            },
            data: users
        }
        res.json(res_json);
    }
    catch(err){
        console.error(err);
    }
});

module.exports = router;