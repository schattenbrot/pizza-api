import { RequestHandler } from 'express';
import * as pizza from './pizza';
import * as order from './order';
import { ValidationError, validationResult } from 'express-validator';
import createHttpError from 'http-errors';

const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    next(
      createHttpError(
        422,
        errors.array().map((err: ValidationError) => {
          if (err.type === 'field') {
            return `${err.msg}: [${err.location} / ${err.path}] (${err.value})`;
          } else if (err.type === 'alternative_grouped') {
            return `${err.msg}: ${err.nestedErrors}`;
          } else if (err.type === 'alternative') {
            return `${err.msg}: ${err.nestedErrors}`;
          } else {
            return `${err.msg}: ${err.fields}`;
          }
          return 'Unprocessable Entity';
        })[0]
      )
    );
    return;
  }
  next();
};

export default { validate, pizza, order };
