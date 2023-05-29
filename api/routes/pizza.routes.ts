import { Router } from 'express';
import {
  createPizza,
  deletePizzaById,
  getAllPizzas,
  getPizzaById,
  updatePizzaById,
} from '../controllers/pizza';
import validators from '../validators';

const router = Router();

/**
 * @swagger
 * /pizza:
 *   post:
 *     summary: Create a new Pizza
 *     tags:
 *       - Pizza
 *     requestBody:
 *       description: Pizza object to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pizza'
 *           example:
 *             name: Salami
 *             image: salami.png
 *             price: 6.99
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pizza'
 *       '422':
 *         description: Invalid value or input
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
  validators.pizza.createPizza,
  validators.validate,
  createPizza
);

/**
 * @swagger
 * /pizza:
 *   get:
 *     summary: Get all pizzas
 *     tags:
 *       - Pizza
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pizza'
 *       '404':
 *         description: Pizzas not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllPizzas);

/**
 * @swagger
 * /pizza/{id}:
 *   get:
 *     summary: Get a Pizza
 *     tags:
 *       - Pizza
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the Pizza to update.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pizza'
 *       '404':
 *         description: Pizza not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 *       '422':
 *         description: Invalid value or input
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
  validators.pizza.getPizza,
  validators.validate,
  getPizzaById
);

/**
 * @swagger
 * /pizza/{id}:
 *   put:
 *     summary: Update a Pizza
 *     tags:
 *       - Pizza
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the Pizza to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pizza'
 *           example:
 *             name: Salami
 *             image: salami.png
 *             price: 6.99
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pizza'
 *       '404':
 *         description: Pizza not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 *       '422':
 *         description: Invalid value or input
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
  validators.pizza.updatePizza,
  validators.validate,
  updatePizzaById
);

/**
 * @swagger
 * /pizza/{id}:
 *   delete:
 *     summary: Delete a Pizza
 *     tags:
 *       - Pizza
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the Pizza to delete.
 *     responses:
 *       '200':
 *         description: Successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: Pizza deleted successfully
 *       '404':
 *         description: Pizza not found
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
  validators.pizza.deletePizza,
  validators.validate,
  deletePizzaById
);

export default router;
