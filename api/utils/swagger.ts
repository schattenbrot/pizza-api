import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';
import logger from './logger';
import { PORT, SERVER } from '../config/environment.config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pizza API',
      version,
      description: 'A REST API for a simple Pizza-Service',
    },
    servers: [
      {
        url: `http://${SERVER}:${PORT}/api`,
      },
    ],
  },
  apis: [
    './api/routes/*.ts',
    './api/models/*.ts',
    './api/utils/errorHandler.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app: Express) => {
  // Swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/docs.json', (req, res) => {
    res.json(swaggerSpec);
  });

  logger.info(`Docs available at http://localhost:${PORT}/docs`);
};

// export default swaggerSpec;
export default swaggerDocs;
