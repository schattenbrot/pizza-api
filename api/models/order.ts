import { Schema, model } from 'mongoose';
import { Pizza } from './pizza';

export enum PizzaStatus {
  ordered,
  oven,
  ready,
  delivering,
  done,
}

export type OrderedPizza = {
  _id?: string;
  pizza: Pizza;
  status: PizzaStatus;
};

export type Customer = {
  name: string;
  address: string;
};

export type Order = {
  _id?: string;
  customer: Customer;
  pizzas: OrderedPizza[];
};

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderedPizza:
 *       type: object
 *       properties:
 *         pizza:
 *           type: string
 *           description: The ID of the Pizza.
 *           format: ObjectId
 *         status:
 *           type: string
 *           enum:
 *             - ordered
 *             - oven
 *             - ready
 *             - delivering
 *             - done
 *           description: The status of the ordered pizza.
 */

const orderedPizzaSchema = new Schema({
  pizza: {
    type: Schema.Types.ObjectId,
    ref: 'Pizza',
  },
  status: {
    type: String,
    enum: PizzaStatus,
  },
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the customer.
 *             address:
 *               type: string
 *               description: The address of the customer.
 *         orderedPizzas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderedPizza'
 *       required:
 *         - customer
 */
const orderSchema = new Schema({
  customer: {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  orderedPizzas: [
    {
      type: Schema.Types.ObjectId,
      ref: 'OrderedPizza',
    },
  ],
});

export const OrderedPizzaSchema = model('OrderedPizza', orderedPizzaSchema);

export default model('Order', orderSchema);
