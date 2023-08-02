import { body, param } from 'express-validator';
import { isValidObjectId } from 'mongoose';
import { PizzaStatus } from '../models/order.model';

export const createOrder = [
  body('customer.name').notEmpty().isString(),
  body('customer.address').notEmpty().isString(),
  body('pizzas')
    .exists()
    .isArray({ min: 1 })
    .custom(value => {
      if (!value.every((item: string) => isValidObjectId(item))) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
];

export const getOrderById = [
  param('id')
    .exists()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
];

export const updateOrder = [
  param('id')
    .exists()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
  body('customer.name').notEmpty().isString(),
  body('customer.address').notEmpty().isString(),
  body('pizzas')
    .exists()
    .isArray({ min: 1 })
    .custom(value => {
      if (!value.every((item: string) => isValidObjectId(item))) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
];

export const deleteOrder = [
  param('id')
    .exists()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
];

export const updateOrderedPizzaStatus = [
  param('id')
    .exists()
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid ObjectId');
      }
      return true;
    }),
  body('index').exists().isNumeric(),
  body('status')
    .exists()
    .custom(value => {
      return Object.values(PizzaStatus).includes(value as PizzaStatus);
    }),
];
