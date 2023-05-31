import { RequestHandler } from 'express';
import { Pizza } from '../models/pizza';
import pizzaService from '../services/pizza';
import createHttpError from 'http-errors';

export const createPizza: RequestHandler<{}, any, Pizza> = async (
  req,
  res,
  next
) => {
  const pizza = req.body;
  try {
    const createdPizza = await pizzaService.createPizza(pizza);
    res.status(201).json(createdPizza);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const getAllPizzas: RequestHandler = async (req, res, next) => {
  try {
    const pizzas = await pizzaService.getAllPizzas();
    if (!pizzas.length) return next(createHttpError(404, 'Pizzas not found'));
    res.json(pizzas);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const getPizzaById: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  const pizzaId = req.params.id;
  try {
    const pizza = await pizzaService.getPizzaById(pizzaId);
    if (!pizza) return next(createHttpError(404, 'Pizza not found'));
    res.json(pizza);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const updatePizzaById: RequestHandler<
  { id: string },
  any,
  Pizza
> = async (req, res, next) => {
  const pizzaId = req.params.id;
  const updatedPizza = req.body;
  try {
    const pizza = await pizzaService.updatePizzaById(pizzaId, updatedPizza);
    if (!pizza) return next(createHttpError(404, 'Pizza not found'));
    res.json(pizza);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const deletePizzaById: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  const pizzaId = req.params.id;
  try {
    const pizza = await pizzaService.deletePizzaById(pizzaId);
    if (!pizza) return next(createHttpError(404, 'Pizza not found'));
    res.json({ message: 'Pizza deleted successfully' });
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};
