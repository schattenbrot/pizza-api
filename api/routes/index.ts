import { Router } from 'express';
import pizzaRoutes from './pizza.routes';
import createHttpError from 'http-errors';

const router = Router();

router.get('/', (req, res) => {
  res.send('Welcome to the pizza api!');
});

router.use('/pizza', pizzaRoutes);

router.use((req, res, next) => {
  next(createHttpError(404, `Page ${req.path} not found`));
});

export default router;
