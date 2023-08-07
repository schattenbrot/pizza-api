import { body, param } from 'express-validator';

export const signUp = [
  body('email')
    .exists()
    .withMessage('Email must be present')
    .isString()
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password must be present')
    .isString()
    .withMessage('Password must be valid'),
  body('password')
    .isLength({ max: 20 })
    .withMessage('Password must be at most 20 characters long')
    .isStrongPassword()
    .withMessage('Password is not strong enough'),
];

export const signIn = [
  body('email')
    .exists()
    .withMessage('Email must be present')
    .isString()
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .isString()
    .withMessage('Password must be present')
    .trim()
    .notEmpty()
    .withMessage('Password must be present'),
];

export const resetPassword = [
  body('email')
    .exists()
    .withMessage('Email must be present')
    .isString()
    .isEmail()
    .withMessage('Email must be valid'),
];

export const resetPasswordByToken = [
  param('token')
    .exists()
    .isString()
    .isAlphanumeric()
    .isLength({ min: 24, max: 24 })
    .withMessage('Token must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password must be present')
    .isString()
    .withMessage('Password must be valid'),
  body('password')
    .isLength({ max: 20 })
    .withMessage('Password must be at most 20 characters long')
    .isStrongPassword()
    .withMessage('Password is not strong enough'),
];
