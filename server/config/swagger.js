const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'JoBika API',
            version: '1.0.0',
            description: 'AI-Powered Job Application Platform API',
            contact: {
                name: 'JoBika Team',
                email: 'support@jobika.com'
            },
            license: {
                name: 'Proprietary',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
            {
                url: 'https://your-app.railway.app',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: []
        }],
    },
    apis: ['./routes/*.js'], // Path to API route files
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
