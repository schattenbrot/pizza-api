import { Router } from 'express';
import 'express-async-errors';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import pizzaRoutes from './pizza.routes';
import orderRoutes from './order.routes';

const router = Router();

router.use('/auth', authRoutes);

router.use('/users', userRoutes);

router.use('/pizzas', pizzaRoutes);

router.use('/orders', orderRoutes);

export default router;
