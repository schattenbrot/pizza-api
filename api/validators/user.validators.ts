import { body, param } from 'express-validator';

export const createUser = [
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

export const getUserById = [
  param('id').exists().isMongoId().withMessage('Id must be valid'),
];

export const updateCurrentUserPassword = [
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
  body('oldPassword')
    .trim()
    .notEmpty()
    .withMessage('Old password must be present')
    .isString()
    .withMessage('Old password must be valid'),
];

export const updateCurrentUserEmail = [
  body('email')
    .exists()
    .withMessage('Email must be present')
    .isString()
    .isEmail()
    .withMessage('Email must be valid'),
];

export const updateUserEmailById = [
  param('id').exists().isMongoId().withMessage('Id must be valid'),
  body('email')
    .exists()
    .withMessage('Email must be present')
    .isString()
    .isEmail()
    .withMessage('Email must be valid'),
];

export const updateUserPasswordById = [
  param('id').exists().isMongoId().withMessage('Id must be valid'),
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

export const updateUserAvatarById = [
  param('id').exists().isMongoId().withMessage('Id must be valid'),
];

export const deleteUser = [
  param('id').exists().isMongoId().withMessage('Id must be valid'),
];
