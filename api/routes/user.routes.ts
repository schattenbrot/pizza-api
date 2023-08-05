import { Router } from 'express';
import 'express-async-errors';

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserEmailById,
  updateUserPasswordById,
} from '../controllers/user.controller';
import validators from '../validators';

const router = Router();

// Create
router.post('/', validators.user.createUser, validators.validate, createUser);

// readall
router.get('/', getAllUsers);

// read
router.get(
  '/:id',
  validators.user.getUserById,
  validators.validate,
  getUserById
);

// update email
router.patch(
  '/:id/email',
  validators.user.updateUserEmailById,
  validators.validate,
  updateUserEmailById
);

// update password
router.patch(
  '/:id/password',
  validators.user.updateUserPasswordById,
  validators.validate,
  updateUserPasswordById
);

// update avatar
router.patch('/:id/avatar');

// delete
router.delete(
  '/:id',
  validators.user.deleteUser,
  validators.validate,
  deleteUser
);

export default router;
