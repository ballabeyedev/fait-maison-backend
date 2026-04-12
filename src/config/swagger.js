const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Fait Maison',
      version: '1.0.0',
      description: 'Documentation API pour les développeurs',
    },
    servers: [
    {
        url: 'https://fait-maison-backend.onrender.com/faitMaison',
    },
    {
        url: 'http://localhost:9000/faitMaison',
    }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },

  // ✅ UNE SEULE LIGNE
  apis: ['./src/routes/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;