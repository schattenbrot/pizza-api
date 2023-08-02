import { RequestHandler } from 'express';
import * as pizza from './pizza.validator';
import * as order from './order.validator';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  const err = errors.array().find(err => err.type === 'field');
  if (err && err.type === 'field') {
    return next(
      createHttpError(
        422,
        `${err.msg}: [${err.location} / ${err.path}] (${err.value})`
      )
    );
  }
  next();
};

export default { validate, pizza, order };
