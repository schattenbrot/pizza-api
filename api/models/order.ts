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
