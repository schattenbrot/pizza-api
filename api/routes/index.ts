import { Router } from 'express';
import pizzaRoutes from './pizza.routes';

const router = Router();

router.get('/', (req, res) => {
  res.send('Welcome to the pizza api!');
});

router.use('/pizza', pizzaRoutes);

router.use((req, res, next) => {
  res.status(404).send('<h1>Page not found</h1>');
});

export default router;
