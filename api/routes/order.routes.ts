import { Router } from 'express';
import validators from '../validators';
import {
  createOrder,
  deleteOrderById,
  getAllOrders,
  getOrderById,
  updateOrderById,
  updateOrderedPizzaStatusById,
} from '../controllers/order';

const router = Router();

router.post(
  '/',
  validators.order.createOrder,
  validators.validate,
  createOrder
);

router.get('/', getAllOrders);

router.get(
  '/:id',
  validators.order.getOrderById,
  validators.validate,
  getOrderById
);

router.put(
  '/:id',
  validators.order.updateOrder,
  validators.validate,
  updateOrderById
);

router.patch(
  '/:id/status',
  validators.order.updateOrderedPizzaStatus,
  validators.validate,
  updateOrderedPizzaStatusById
);

router.delete(
  '/:id',
  validators.order.deleteOrder,
  validators.validate,
  deleteOrderById
);
