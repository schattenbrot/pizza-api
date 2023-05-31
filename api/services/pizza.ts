import PizzaModel, { Pizza } from '../models/pizza';

const createPizza = async (pizza: Pizza) => {
  return await PizzaModel.create(pizza);
};

const getAllPizzas = async () => {
  return await PizzaModel.find();
};

const getPizzaById = async (pizzaId: string) => {
  return await PizzaModel.findById(pizzaId);
};

const updatePizzaById = async (pizzaId: string, updatedPizza: Pizza) => {
  return await PizzaModel.findByIdAndUpdate(pizzaId, updatedPizza, {
    new: true,
  });
};

const deletePizzaById = async (pizzaId: string) => {
  return await PizzaModel.findByIdAndDelete(pizzaId);
};

export default {
  createPizza,
  getAllPizzas,
  getPizzaById,
  updatePizzaById,
  deletePizzaById,
};
