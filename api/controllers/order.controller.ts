import { RequestHandler } from 'express';
import { IOrder, Order, PizzaStatus } from '../models/order.model';
import createHttpError from 'http-errors';
import orderService from '../services/order.service';
import pizzaService from '../services/pizza.service';
import { IPizza } from '../models/pizza.model';

type OrderInput = {
  customer: {
    name: string;
    address: string;
  };
  pizzas: string[];
};

export const createOrder: RequestHandler<{}, any, OrderInput> = async (
  req,
  res
) => {
  const orderInput = req.body;
  const pizzas: IPizza[] = [];

  for (const pizzaId of orderInput.pizzas) {
    const pizza = await pizzaService.getPizzaById(pizzaId);
    if (pizza) {
      pizzas.push({
        name: pizza.name,
        image: pizza.image,
        price: pizza.price,
      });
    }
  }

  if (!pizzas.length) {
    throw createHttpError(404, 'Pizzas not found');
  }

  const order: IOrder = {
    customer: orderInput.customer,
    pizzas: pizzas.map(pizza => ({
      pizza,
      status: PizzaStatus.ordered,
    })),
  };
  const newOrder = await orderService.createOrder(order);
  res.status(201).json(newOrder);
};

export const getAllOrders: RequestHandler = async (req, res) => {
  const orders = await orderService.getAllOrders();
  if (!orders.length) {
    throw createHttpError(404, 'Orders not found');
  }
  res.json(orders);
};

export const getOrderById: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const orderId = req.params.id;
  const order = await orderService.getOrderById(orderId);
  if (!order) {
    throw createHttpError(404, 'Order not found');
  }
  res.json(order);
};

export const updateOrderById: RequestHandler<
  { id: string },
  any,
  OrderInput
> = async (req, res) => {
  const orderId = req.params.id;
  const orderInput = req.body;

  const updatedPizzas: IPizza[] = [];
  for (const pizzaId of orderInput.pizzas) {
    const pizza = await pizzaService.getPizzaById(pizzaId);
    if (pizza) {
      updatedPizzas.push({
        name: pizza.name,
        image: pizza.image,
        price: pizza.price,
      });
    }
  }
  if (!updatedPizzas.length) {
    throw createHttpError(404, 'Pizzas not found');
  }

  const updatedOrder: IOrder = {
    customer: orderInput.customer,
    pizzas: updatedPizzas.map(pizza => ({
      pizza,
      status: PizzaStatus.ordered,
    })),
  };

  const order = await orderService.updateOrderById(orderId, updatedOrder);
  if (!order) {
    throw createHttpError(404, 'Order not found');
  }

  res.status(200).json(order);
};

export const updateOrderedPizzaStatusById: RequestHandler<
  { id: string },
  any,
  { index: number; status: PizzaStatus }
> = async (req, res) => {
  const orderId = req.params.id;
  const { index, status } = req.body;
  const orderedPizza = await orderService.updateOrderedPizzaStatusById(
    orderId,
    index,
    status
  );
  if (!orderedPizza) {
    throw createHttpError(404, 'Order not found');
  }
  res.json(orderedPizza);
};

export const deleteOrderById: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const orderId = req.params.id;
  const order = await orderService.deleteOrderById(orderId);
  if (!order) {
    throw createHttpError(404, 'Order not found');
  }
  res.json({ message: 'Order deleted successfully' });
};
