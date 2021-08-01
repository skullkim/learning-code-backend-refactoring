const express = require('express');
const dotenv = require('dotenv');
const User = require('./models/users');
const {Op} = require('sequelize');

const {sequelize} = require('./models');

const app = express();

dotenv.config();

sequelize.sync({force:false})
    .then(() => console.log('success to connect DB'))
    .catch((err) => console.error(err));

app.set('port', process.env.PORT || 8080);

app.get('/', async (req, res, next) => {
    try{
       const users = await User.findAll({
           where: {id: {[Op.gt]: 0}},
       });
       res.setHeader('Content-Type', 'application/json');
       res.status(200);
       res.json(users);
    }
    catch(err){
        console.error(err);
    }
});

app.use((req, res, next) => {
    const error = new Error(`${res.method} ${req.url} router doesn't exist`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_DEV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.send(res.locals.message);
})

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')} start server`);
});