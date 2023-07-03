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

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Create an Order
 *     tags:
 *       - Order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the customer.
 *                   address:
 *                     type: string
 *                     description: The address of the customer.
 *               pizzas:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: The ID of the pizza.
 *                   format: OrderId
 *             required:
 *               - customer
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  validators.order.createOrder,
  validators.validate,
  createOrder
);

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Get all orders
 *     tags:
 *       - Order
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllOrders);

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Get an Order by ID
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the Order to retrieve.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:id',
  validators.order.getOrderById,
  validators.validate,
  getOrderById
);

/**
 * @swagger
 * /order/{id}:
 *   put:
 *     summary: Update an Order by ID
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the Order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id',
  validators.order.updateOrder,
  validators.validate,
  updateOrderById
);

/**
 * @swagger
 * /order/{id}/status:
 *   patch:
 *     summary: Update the status of an Order by ID
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the Order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               index:
 *                 type: number
 *               status:
 *                 type: number
 *                 enum:
 *                   - ordered
 *                   - oven
 *                   - ready
 *                   - delivering
 *                   - done
 *                 description: The new status of the Order.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/status',
  validators.order.updateOrderedPizzaStatus,
  validators.validate,
  updateOrderedPizzaStatusById
);

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     summary: Delete an Order by ID
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the Order to delete.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/:id',
  validators.order.deleteOrder,
  validators.validate,
  deleteOrderById
);

export default router;
