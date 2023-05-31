import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import routes from '../routes';
import corsOptions from './corsOptions';
import errorHandler from './errorHandler';
import swaggerDocs from './swagger';
import createHttpError from 'http-errors';

const app = express();

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

swaggerDocs(app);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the pizza api!' });
});

app.use('/api', routes);

app.use((req, res, next) => {
  next(createHttpError(404, `Page ${req.path} not found`));
});

app.use(errorHandler);

export default app;
