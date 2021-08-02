const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "learning code API",
            version: '1.0.0',
            description: 'learning code API',
        },
        host: 'localhost:8080',
        basePath: '/',
        servers: [
            {
                url: 'http://localhost:8080/',
            },
        ],
    },
    apis: ['./routes/*.js', './swagger/*']
}

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};