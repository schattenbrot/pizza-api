import { RequestHandler } from 'express';
import { IPizza } from '../models/pizza.model';
import pizzaService from '../services/pizza.service';
import createHttpError from 'http-errors';

export const createPizza: RequestHandler<{}, any, IPizza> = async (
  req,
  res
) => {
  const pizza = req.body;
  const createdPizza = await pizzaService.createPizza(pizza);
  res.status(201).json(createdPizza);
};

export const getAllPizzas: RequestHandler = async (req, res, next) => {
  const pizzas = await pizzaService.getAllPizzas();
  if (!pizzas.length) {
    throw createHttpError(404, 'Pizzas not found');
  }
  res.json(pizzas);
};

export const getPizzaById: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const pizzaId = req.params.id;
  const pizza = await pizzaService.getPizzaById(pizzaId);
  if (!pizza) {
    throw createHttpError(404, 'Pizza not found');
  }
  res.json(pizza);
};

export const updatePizzaById: RequestHandler<
  { id: string },
  any,
  IPizza
> = async (req, res) => {
  const pizzaId = req.params.id;
  const updatedPizza = req.body;
  const pizza = await pizzaService.updatePizzaById(pizzaId, updatedPizza);
  if (!pizza) {
    throw createHttpError(404, 'Pizza not found');
  }
  res.json(pizza);
};

export const deletePizzaById: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const pizzaId = req.params.id;
  const pizza = await pizzaService.deletePizzaById(pizzaId);
  if (!pizza) {
    throw createHttpError(404, 'Pizza not found');
  }
  res.json({ message: 'Pizza deleted successfully' });
};
