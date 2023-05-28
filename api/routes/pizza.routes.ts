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
 * components:
 *   schemas:
 *     Pizza:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         image:
 *           type: string
 *         price:
 *           type: number
 *       required:
 *         - name
 *         - image
 *         - price
 */

/**
 * @swagger
 * /api/pizza/{id}:
 *   post:
 *     summary: Create a new Pizza
 *     tags: [Pizza]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Pizza object to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pizza'
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pizza'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post(
  '/',
  validators.pizza.createPizza,
  validators.validate,
  createPizza
);

router.get('/', getAllPizzas);

router.get(
  '/:id',
  validators.pizza.getPizza,
  validators.validate,
  getPizzaById
);

router.put(
  '/:id',
  validators.pizza.updatePizza,
  validators.validate,
  updatePizzaById
);

router.delete(
  '/:id',
  validators.pizza.deletePizza,
  validators.validate,
  deletePizzaById
);

export default router;
