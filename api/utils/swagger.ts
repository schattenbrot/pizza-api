import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';
import logger from './logger';
import { PORT, SERVER } from './environment';

const options: swaggerJSDoc.Options = {
  definition: {
    openai: '3.0.0',
    info: {
      title: 'REST API Documentation',
      version,
    },
    servers: [`${SERVER}:${PORT}`],
  },
  apis: ['./api/routes/*.ts', './api/models/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app: Express) => {
  // Swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('docs.json', (req, res) => {
    res.json(swaggerSpec);
  });

  logger.info(`Docs available at http://localhost:${PORT}/docs`);
};

// export default swaggerSpec;
export default swaggerDocs;
