const express = require('express');
const app = express();

app.set('port', process.env.PORT || 8080);

app.get('/', (req, res, next) => {
    res.setHeader('Content-Type', 'application/vnd.api+json');
    res.status(200);
    res.json({
       "data": {
           "tmp": "tmp"
       }
    });
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