import OrderModel, { Order, PizzaStatus } from '../models/order';

const createOrder = async (order: Order) => {
  return await OrderModel.create(order);
};

const getAllOrders = async () => {
  return await OrderModel.find();
};

const getOrderById = async (orderId: string) => {
  return await OrderModel.findById(orderId);
};

const updateOrderById = async (orderId: string, order: Order) => {
  return await OrderModel.findByIdAndUpdate(orderId, order, { new: true });
};

const updateOrderedPizzaStatusById = async (
  orderId: string,
  index: number,
  status: PizzaStatus
) => {
  return await OrderModel.findByIdAndUpdate(
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
  return await OrderModel.findByIdAndDelete(orderId);
};

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  updateOrderedPizzaStatusById,
  deleteOrderById,
};
