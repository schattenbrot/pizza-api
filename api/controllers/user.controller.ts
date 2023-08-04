import { Request, Response } from 'express';
import { IUser } from '../models/user.model';
import userService from '../services/user.service';
import createHttpError from 'http-errors';

export const createUser = async (
  req: Request<{}, {}, IUser>,
  res: Response
) => {
  const user = req.body;
  const createdUser = await userService.createUser(user);
  res.status(201).send(createdUser);
};

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  if (users.length === 0) {
    throw createHttpError(404, 'Users not found');
  }
  res.send(users);
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  res.send(user);
};

export const updateUserEmailById = async (
  req: Request<{ id: string }, {}, { email: string }>,
  res: Response
) => {
  const { id } = req.params;
  const { email } = req.body;
  const user = await userService.getUserById(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  user.email = email;
  const updatedUser = await user.save();
  res.send(updatedUser);
};

export const updateUserPasswordById = async (
  req: Request<{ id: string }, {}, { password: string }>,
  res: Response
) => {
  const { id } = req.params;
  const { password } = req.body;
  const user = await userService.getUserById(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  user.password = password;
  const updatedUser = await user.save();
  res.send(updatedUser);
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  const deletedPizza = await userService.deletePizzaById(id);
  if (!deletedPizza) {
    throw createHttpError(404, 'User not found');
  }
  res.send({ message: 'User deleted successfully' });
};
