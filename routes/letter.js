const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.json({a: 1});
});

module.exports = router;