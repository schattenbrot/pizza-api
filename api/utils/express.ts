import bodyParser from 'body-parser';
import express from 'express';
import { PORT } from './environment';
import swaggerSpec from './swagger';
import swaggerUi from 'swagger-ui-express';
import routes from '../routes';
import errorHandler from './errorHandler';
import logger from './logger';
import swaggerDocs from './swagger';

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

swaggerDocs(app);

// // Swagger page
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // Docs in JSON format
// app.get('docs.json', (req, res) => {
//   res.json(swaggerSpec);
// });

// logger.info(`Docs available at http://localhost:${PORT}/docs`);

app.use(routes);

app.use(errorHandler);

export default app;
