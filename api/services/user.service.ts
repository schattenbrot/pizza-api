import { IUser, User } from '../models/user.model';

const createUser = async (user: IUser) => {
  return User.create(user);
};

const getAllUsers = async () => {
  return User.find();
};

const getUserById = async (userId: string) => {
  return User.findById(userId);
};

const deletePizzaById = async (userId: string) => {
  return User.findByIdAndDelete(userId);
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  deletePizzaById,
};
