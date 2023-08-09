import { Router } from 'express';
import 'express-async-errors';

import {
  createUser,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateCurrentUserEmail,
  updateCurrentUserPassword,
  updateUserEmailById,
  updateUserPasswordById,
} from '../controllers/user.controller';
import validators from '../validators';
import { isAuth } from '../middlewares/isAuth';
import { currentUser } from '../middlewares/currentUser';

const router = Router();

// Create
router.post(
  '/',
  currentUser,
  isAuth,
  validators.user.createUser,
  validators.validate,
  createUser
);

// readall
router.get('/', currentUser, isAuth, getAllUsers);

// read current user
router.get('/me', currentUser, isAuth, getCurrentUser);

// read
router.get(
  '/:id',
  currentUser,
  isAuth,
  validators.user.getUserById,
  validators.validate,
  getUserById
);

router.patch(
  '/me/email',
  currentUser,
  isAuth,
  validators.user.updateCurrentUserEmail,
  validators.validate,
  updateCurrentUserEmail
);

// update email
router.patch(
  '/:id/email',
  currentUser,
  isAuth,
  validators.user.updateUserEmailById,
  validators.validate,
  updateUserEmailById
);

router.patch(
  '/me/password',
  currentUser,
  isAuth,
  validators.user.updateCurrentUserPassword,
  validators.validate,
  updateCurrentUserPassword
);

// update password
router.patch(
  '/:id/password',
  currentUser,
  isAuth,
  validators.user.updateUserPasswordById,
  validators.validate,
  updateUserPasswordById
);

// update avatar
router.patch('/:id/avatar');

// delete
router.delete(
  '/:id',
  currentUser,
  isAuth,
  validators.user.deleteUser,
  validators.validate,
  deleteUser
);

export default router;
