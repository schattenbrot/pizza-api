import { Request, RequestHandler, Response } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { IUser } from '../models/user.model';
import userService from '../services/user.service';

export const createUser: RequestHandler<{}, {}, IUser> = async (req, res) => {
  const user = req.body;
  const createdUser = await userService.createUser(user);
  res.status(201).send(createdUser);
};

export const getAllUsers: RequestHandler = async (req, res) => {
  const users = await userService.getAllUsers();
  res.send(users);
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  const { id } = req.currentUser!;
  const user = await userService.getUserById(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  res.send(user);
};

export const getUserById: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  res.send(user);
};

export const updateCurrentUserEmail: RequestHandler<
  {},
  {},
  { email: string }
> = async (req, res) => {
  const { id } = req.currentUser!;
  const { email } = req.body;
  const user = await userService.getUserById(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  user.email = email;
  const updatedUser = await user.save();
  res.send(updatedUser);
};

export const updateUserEmailById: RequestHandler<
  { id: string },
  {},
  { email: string }
> = async (req, res) => {
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

export const updateCurrentUserPassword: RequestHandler<
  {},
  {},
  { password: string; oldPassword: string }
> = async (req, res) => {
  const { id } = req.currentUser!;
  const { password, oldPassword } = req.body;

  const user = await userService.getUserByIdWithPassword(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isMatchingPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isMatchingPassword) {
    throw createHttpError(400, 'Invalid credentials');
  }

  user.password = password;
  const updatedUser = await user.save();
  res.send(updatedUser);
};

export const updateUserPasswordById: RequestHandler<
  { id: string },
  {},
  { password: string }
> = async (req, res) => {
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

export const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const deletedUser = await userService.deleteUserById(id);
  if (!deletedUser) {
    throw createHttpError(404, 'User not found');
  }
  res.send({ message: 'User deleted successfully' });
};
