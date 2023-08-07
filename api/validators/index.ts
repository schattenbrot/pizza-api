import { RequestHandler } from 'express';
import * as auth from './auth.validator';
import * as user from './user.validators';
import * as pizza from './pizza.validator';
import * as order from './order.validator';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  const err = errors.array().find(err => err.type === 'field');
  if (err && err.type === 'field') {
    if (err.path === 'password') {
      err.value = '';
    }

    return next(
      createHttpError(
        422,
        `${err.msg}: [${err.location} / ${err.path}] (${err.value})`
      )
    );
  }
  next();
};

export default { validate, auth, user, pizza, order };
