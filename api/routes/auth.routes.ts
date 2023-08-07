import { Router } from 'express';
import 'express-async-errors';

import {
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '../controllers/auth.controller';
import validators from '../validators';

const router = Router();

router.post('/sign-up', validators.auth.signUp, validators.validate, signUp);

router.post('/sign-in', validators.auth.signIn, validators.validate, signIn);

router.get('/sign-out', signOut);

router.post(
  '/password-reset',
  validators.auth.resetPassword,
  validators.validate,
  resetPassword
);

router.post(
  '/password-reset/:token',
  validators.auth.resetPasswordByToken,
  validators.validate,
  updatePassword
);

export default router;
