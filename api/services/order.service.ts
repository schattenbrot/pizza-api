import {
  Order,
  IOrderDocument,
  IOrder,
  PizzaStatus,
} from '../models/order.model';

const createOrder = async (order: IOrder) => {
  return Order.create(order);
};

const getAllOrders = async () => {
  return await Order.find();
};

const getOrderById = async (orderId: string) => {
  return await Order.findById(orderId);
};

const updateOrderById = async (orderId: string, order: IOrder) => {
  return await Order.findByIdAndUpdate(orderId, order, { new: true });
};

const updateOrderedPizzaStatusById = async (
  orderId: string,
  index: number,
  status: PizzaStatus
) => {
  return await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        [`pizzas.${index}.status`]: status,
      },
    },
    { new: true }
  );
};

const deleteOrderById = async (orderId: string) => {
  return await Order.findByIdAndDelete(orderId);
};

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  updateOrderedPizzaStatusById,
  deleteOrderById,
};
