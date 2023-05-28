import { RequestHandler } from 'express';
import PizzaModel, { Pizza } from '../models/pizza';
import createHttpError, { UnknownError } from 'http-errors';

export const createPizza: RequestHandler<{}, any, Pizza> = async (
  req,
  res,
  next
) => {
  const pizza = req.body;
  try {
    const newPizza = new PizzaModel(pizza);
    const response = await newPizza.save();
    res.status(201).json(response);
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};

export const getAllPizzas: RequestHandler = async (req, res, next) => {
  try {
    const pizzas = await PizzaModel.find();
    if (!pizzas) return next(createHttpError(404, 'Pizzas not found'));
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
    const pizza = await PizzaModel.findById(pizzaId);
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
    const pizza = await PizzaModel.findByIdAndUpdate(pizzaId, updatedPizza, {
      new: true,
    });
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
    const pizza = await PizzaModel.findByIdAndDelete(pizzaId);
    if (!pizza) return next(createHttpError(404, 'Pizza not found'));
    res.json({ message: 'Pizza deleted successfully' });
  } catch (err: any) {
    next(createHttpError(500, 'Internal Server Error', err));
  }
};
