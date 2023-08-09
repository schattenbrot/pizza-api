import bodyParser from 'body-parser';
import express from 'express';
import 'express-async-errors';
import createHttpError from 'http-errors';
import cookieSession from 'cookie-session';
import cors from 'cors';

import corsOptions from './cors.config';
import errorHandler from '../middlewares/errorHandler';
import swaggerDocs from './swagger.config';
import routes from '../routes';

const app = express();

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'production',
  })
);

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
