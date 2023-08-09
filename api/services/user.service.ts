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

const getUserByIdWithPassword = async (userId: string) => {
  return User.findById(userId).select('+password');
};

const getUserByEmail = async (email: string) => {
  return User.findOne({ email }).select('+password');
};

const getUserByResetToken = async (token: string) => {
  return User.findOne({ resetToken: token }).select(
    '+resetToken +resetTokenExpires'
  );
};

const deleteUserById = async (userId: string) => {
  return User.findByIdAndDelete(userId);
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  getUserByIdWithPassword,
  getUserByEmail,
  getUserByResetToken,
  deleteUserById,
};
