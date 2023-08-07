import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { JWT_SECRET } from '../config/environment.config';
import { IUser } from '../models/user.model';
import userService from '../services/user.service';
import { randomBytes } from 'crypto';
import isTokenExpired from '../utils/resetTokenExpiration';

export const signUp: RequestHandler<{}, {}, IUser> = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    throw createHttpError(400, 'Email is already in use');
  }

  const user = await userService.createUser({
    email,
    password,
  });

  const userJWT = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET
  );
  req.session = {
    jwt: userJWT,
  };

  res.status(201).send(user);
};

export const signIn: RequestHandler<{}, {}, IUser> = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw createHttpError(400, 'Invalid credentials');
  }

  // check password
  const isMatchingPassword = await bcrypt.compare(password, user.password);
  if (!isMatchingPassword) {
    throw createHttpError(400, 'Invalid credentials');
  }

  const userJWT = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET
  );
  req.session = {
    jwt: userJWT,
  };

  res.send(user);
};

export const signOut: RequestHandler<{}, {}, IUser> = async (req, res) => {
  req.session = null;

  res.send({});
};

export const resetPassword: RequestHandler<{}, {}, { email: string }> = async (
  req,
  res
) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw createHttpError(400, 'Invalid credentials');
  }

  let date = new Date();
  user.resetToken = randomBytes(12).toString('hex');
  user.resetTokenExpires = date.setDate(date.getDate() + 1).valueOf();
  user.save();

  // TODO send email notification

  res.send();
};

export const updatePassword: RequestHandler<
  { token: string },
  {},
  { password: string }
> = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // get user of token
  const user = await userService.getUserByResetToken(token);
  if (!user) {
    throw createHttpError(403, 'Token invalid');
  }
  if (!user.resetToken || !user.resetTokenExpires) {
    throw createHttpError(403, 'Token invalid');
  }

  const isExpired = isTokenExpired(user.resetTokenExpires);
  if (isExpired) {
    throw createHttpError(403, 'Token invalid');
  }

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  user.save();

  // get user from token
  res.send();
};
