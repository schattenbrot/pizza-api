import { RequestHandler } from 'express';
import OrderSchema, {
  Order,
  OrderedPizza,
  OrderedPizzaModel,
  PizzaStatus,
} from '../models/order';
import createHttpError from 'http-errors';
import orderService from '../services/order';
import pizzaService from '../services/pizza';
import { Pizza } from '../models/pizza';

type OrderInput = {
  customer: {
    name: string;
    address: string;
  };
  pizzas: string[];
};

export const createOrder: RequestHandler<{}, any, OrderInput> = async (
  req,
  res,
  next
) => {
  const orderInput = req.body;
  const updatedPizzas: Pizza[] = [];

  for (const pizzaId of orderInput.pizzas) {
    try {
      const pizza = await pizzaService.getPizzaById(pizzaId);
      if (pizza) {
        updatedPizzas.push({
          _id: pizzaId,
          name: pizza.name,
          image: pizza.image,
          price: pizza.price,
        });
      }
    } catch (err) {
      // ignore errors
    }
  }

  if (!updatedPizzas.length) {
    return next(createHttpError(404, 'Pizzas not found'));
  }

  try {
    const newOrder: Order = {
      customer: orderInput.customer,
      pizzas: updatedPizzas.map(pizza => {
        return {
          pizza,
          status: PizzaStatus.ordered,
        };
      }),
    };

    const order = await orderService.createOrder(newOrder);
    res.status(201).json(order);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const getAllOrders: RequestHandler = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    if (!orders.length) return next(createHttpError(404, 'Orders not found'));
    res.json(orders);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const getOrderById: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  const orderId = req.params.id;
  try {
    const order = await orderService.getOrderById(orderId);
    if (!order) return next(createHttpError(404, 'Order not found'));
    res.json(order);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const updateOrderById: RequestHandler<
  { id: string },
  any,
  OrderInput
> = async (req, res, next) => {
  const orderId = req.params.id;
  const updatedOrderInput = req.body;

  const updatedPizzas: Pizza[] = [];
  for (const pizzaId of updatedOrderInput.pizzas) {
    try {
      const pizza = await pizzaService.getPizzaById(pizzaId);
      if (pizza) {
        updatedPizzas.push({
          _id: pizzaId,
          name: pizza.name,
          image: pizza.image,
          price: pizza.price,
        });
      }
    } catch (err) {
      //ignore error
    }
  }
  if (!updatedPizzas.length) {
    return next(createHttpError(404, 'Pizzas not found'));
  }

  try {
    const updatedOrder: Order = {
      customer: updatedOrderInput.customer,
      pizzas: updatedPizzas.map(pizza => {
        return {
          pizza,
          status: PizzaStatus.ordered,
        };
      }),
    };

    const order = await orderService.updateOrderById(orderId, updatedOrder);
    if (!order) return next(createHttpError(404, 'Order not found'));
    res.status(200).json(order);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const updateOrderedPizzaStatusById: RequestHandler<
  { id: string },
  any,
  { index: number; status: PizzaStatus }
> = async (req, res, next) => {
  const orderId = req.params.id;
  const { index, status } = req.body;
  try {
    const orderedPizza = await orderService.updateOrderedPizzaStatusById(
      orderId,
      index,
      status
    );
    if (!orderedPizza) return next(createHttpError(404, 'Order not found'));
    res.json(orderedPizza);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const deleteOrderById: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  const orderId = req.params.id;
  try {
    const order = await orderService.deleteOrderById(orderId);
    if (!order) return next(createHttpError(404, 'Order not found'));
    res.json({ message: 'Order deleted successfully' });
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};
