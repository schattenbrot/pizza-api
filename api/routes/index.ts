import { Router } from 'express';
import 'express-async-errors';
import pizzaRoutes from './pizza.routes';
import orderRoutes from './order.routes';

const router = Router();

router.use('/pizza', pizzaRoutes);

router.use('/order', orderRoutes);

export default router;
