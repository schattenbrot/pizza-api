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

const getUserByEmail = async (email: string) => {
  return User.findOne({ email }).select('+password');
};

const getUserByResetToken = async (token: string) => {
  return User.findOne({ resetToken: token })
    .select('+resetToken +resetTokenExpires')
    .then(user => {
      console.log(user);
      return user;
    });
};

const deletePizzaById = async (userId: string) => {
  return User.findByIdAndDelete(userId);
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByResetToken,
  deletePizzaById,
};
