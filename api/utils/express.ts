import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import routes from '../routes';
import corsOptions from './corsOptions';
import errorHandler from './errorHandler';
import swaggerDocs from './swagger';

const app = express();

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

swaggerDocs(app);

app.use('/api', routes);

app.use(errorHandler);

export default app;
