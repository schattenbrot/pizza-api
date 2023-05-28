import { RequestHandler } from 'express';
import * as pizza from './pizza';
import * as order from './order';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(createHttpError(422, 'Unprocessable Content', errors));
    return;
  }
  next();
};

export default { validate, pizza, order };
