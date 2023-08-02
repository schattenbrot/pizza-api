import { body, param } from 'express-validator';
import { isValidObjectId } from 'mongoose';

export const createPizza = [
  body('name').exists().isString(),
  body('image').exists().isString(),
  body('price').exists().isNumeric(),
];

export const getPizza = [
  param('id')
    .exists()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
];

export const updatePizza = [
  param('id')
    .exists()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
  body('name').exists().isString(),
  body('image').exists().isString(),
  body('price').exists().isNumeric(),
];

export const deletePizza = [
  param('id')
    .exists()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
];
