const express = require('express');

const {verifyToken} = require('./middleware');

const router = express.Router();

router.get('/profile/:userId', verifyToken, (req, res, next) => {
    const {userId} = req.params;
    res.json({userId});
});

module.exports = router;