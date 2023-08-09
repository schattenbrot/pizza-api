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

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Sign Up User
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 format: email
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 format: password
 *                 example: aaBB12!@
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '201':
 *         description: Successful operation (with cookie)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sign-up', validators.auth.signUp, validators.validate, signUp);

/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: Sign In User
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 format: email
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 format: password
 *                 example: aaBB12!@
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Successful operation (with cookie)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sign-in', validators.auth.signIn, validators.validate, signIn);

/**
 * @swagger
 * /auth/sign-out:
 *   get:
 *     summary: Sign Out User
 *     tags:
 *       - Auth
 *     responses:
 *       '200':
 *         description: Successful operation (with cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/sign-out', signOut);

/**
 * @swagger
 * /auth/password-reset:
 *   post:
 *     summary: Request password reset
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       '200':
 *         description: Successful operation (with cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/password-reset',
  validators.auth.resetPassword,
  validators.validate,
  resetPassword
);

/**
 * @swagger
 * /auth/password-reset/{token}:
 *   post:
 *     summary: Change password on request reset password
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectID
 *         description: The token to validate the password reset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password of the user.
 *                 format: password
 *             required:
 *               - password
 *     responses:
 *       '200':
 *         description: Successful operation (with cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '422':
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnprocessableEntity'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/password-reset/:token',
  validators.auth.resetPasswordByToken,
  validators.validate,
  updatePassword
);

export default router;
