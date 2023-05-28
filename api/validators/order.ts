import { body, param } from 'express-validator';
import { isValidObjectId } from 'mongoose';
import { OrderedPizza, PizzaStatus } from '../models/order';

export const createOrder = [
  body('customer.name').notEmpty().isString(),
  body('customer.address').notEmpty().isString(),
  body('orderedPizzas')
    .exists()
    .isArray({ min: 1 })
    .custom(value => {
      // Custom validation to check each OrderedPizza object in the array
      const isValidPizzas = value.every((orderedPizza: OrderedPizza) => {
        return (
          typeof orderedPizza.pizza === 'object' &&
          isValidObjectId(orderedPizza.pizza._id) &&
          typeof orderedPizza.pizza.name === 'string' &&
          typeof orderedPizza.pizza.image === 'string' &&
          typeof orderedPizza.pizza.price === 'number' &&
          typeof orderedPizza.status === 'string' &&
          Object.values(PizzaStatus).includes(
            orderedPizza.status as PizzaStatus
          )
        );
      });
      if (!isValidPizzas) {
        throw new Error('Invalid pizzas array');
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
  body('orderedPizzas')
    .exists()
    .isArray({ min: 1 })
    .custom(value => {
      // Custom validation to check each OrderedPizza object in the array
      const isValidPizzas = value.every((orderedPizza: OrderedPizza) => {
        return (
          typeof orderedPizza.pizza === 'object' &&
          isValidObjectId(orderedPizza.pizza._id) &&
          typeof orderedPizza.pizza.name === 'string' &&
          typeof orderedPizza.pizza.image === 'string' &&
          typeof orderedPizza.pizza.price === 'number' &&
          Object.values(PizzaStatus).includes(
            orderedPizza.status as PizzaStatus
          )
        );
      });
      if (!isValidPizzas) {
        throw new Error('Invalid pizzas array');
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
  body('status').custom(value => {
    Object.values(PizzaStatus).includes(value as PizzaStatus);
  }),
];
