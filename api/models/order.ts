import { Schema, Types, model } from 'mongoose';
import { Pizza, PizzaSchema } from './pizza';

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
 *         _id:
 *           type: string
 *           description: The ID of the ordered pizz.
 *           format: ObjectId
 *         pizza:
 *           $ref: '#/components/schemas/Pizza'
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

export const OrderedPizzaSchema = new Schema({
  pizza: PizzaSchema,
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
 *         _id:
 *           type: string
 *           description: The ID of the order.
 *           format: ObjectId
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the customer.
 *             address:
 *               type: string
 *               description: The address of the customer.
 *         pizzas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderedPizza'
 *       required:
 *         - customer
 */
const OrderSchema = new Schema({
  customer: {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  pizzas: [
    {
      pizza: {
        _id: Types.ObjectId,
        name: {
          type: String,
        },
        image: {
          type: String,
        },
        price: {
          type: Number,
        },
      },
      status: {
        type: Number,
        enum: PizzaStatus,
      },
    },
  ],
});

export const OrderedPizzaModel = model('OrderedPizza', OrderedPizzaSchema);

export default model('Order', OrderSchema);
