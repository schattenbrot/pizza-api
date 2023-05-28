import { RequestHandler } from 'express';
import OrderSchema, {
  Order,
  OrderedPizzaSchema,
  PizzaStatus,
} from '../models/order';
import createHttpError from 'http-errors';

export const createOrder: RequestHandler<{}, any, Order> = async (
  req,
  res,
  next
) => {
  const order = req.body;
  try {
    const newOrder = new OrderSchema(order);
    const response = await newOrder.save();
    res.status(201).json(response);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const getAllOrders: RequestHandler = async (req, res, next) => {
  try {
    const orders = await OrderSchema.find();
    if (!orders) return next(createHttpError(404, 'Orders not found'));
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
    const order = await OrderSchema.findById(orderId);
    if (!order) return next(createHttpError(404, 'Order not found'));
    res.json(order);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const updateOrderById: RequestHandler<
  { id: string },
  any,
  Order
> = async (req, res, next) => {
  const orderId = req.params.id;
  const updatedOrder = req.body;
  try {
    const order = await OrderSchema.findByIdAndUpdate(orderId, updatedOrder, {
      new: true,
    });
    if (!order) return next(createHttpError(404, 'Order not found'));
    res.json(order);
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
    const order = await OrderSchema.findByIdAndDelete(orderId);
    if (!order) return next(createHttpError(404, 'Order not found'));
    res.json({ message: 'Order deleted successfully' });
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const updateOrderedPizzaStatusById: RequestHandler<
  { id: string },
  any,
  { status: PizzaStatus }
> = async (req, res, next) => {
  const orderedPizzaId = req.params.id;
  const updatedOrderedPizza = req.body;
  try {
    const orderedPizza = await OrderedPizzaSchema.findByIdAndUpdate(
      orderedPizzaId,
      updatedOrderedPizza,
      { new: true }
    );
    if (!orderedPizza)
      return next(createHttpError(404, 'OrderedPizza not found'));
    res.json(orderedPizza);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};
