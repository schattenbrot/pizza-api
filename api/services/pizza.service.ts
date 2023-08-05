import { Pizza, IPizza } from '../models/pizza.model';

const createPizza = async (pizza: IPizza) => {
  return Pizza.create(pizza);
};

const getAllPizzas = async () => {
  return Pizza.find();
};

const getPizzaById = async (pizzaId: string) => {
  return Pizza.findById(pizzaId);
};

const updatePizzaById = async (pizzaId: string, updatedPizza: IPizza) => {
  return Pizza.findByIdAndUpdate(pizzaId, updatedPizza, {
    new: true,
  });
};

const deletePizzaById = async (pizzaId: string) => {
  return Pizza.findByIdAndDelete(pizzaId);
};

export default {
  createPizza,
  getAllPizzas,
  getPizzaById,
  updatePizzaById,
  deletePizzaById,
};
