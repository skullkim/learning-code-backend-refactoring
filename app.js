const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const {sequelize} = require('./models');
const passportConfig = require('./passport');

const app = express();

dotenv.config();

sequelize.sync({force:false})
    .then(() => console.log('success to connect DB'))
    .catch((err) => console.error(err));

app.set('port', process.env.PORT || 8080);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(passport.initialize());
passportConfig();

const index_router = require('./routes');
const letters_router = require('./routes/letters');
const auth_router = require('./routes/auth');

app.use('/', index_router);
app.use('/letters', letters_router);
app.use('/authentication', auth_router);

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