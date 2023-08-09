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

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a User (Requries auth)
 *     tags:
 *       - User
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
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
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
  '/',
  currentUser,
  isAuth,
  validators.user.createUser,
  validators.validate,
  createUser
);

/**
 * @swagger
 * /pizzas:
 *   get:
 *     summary: Read all users (Requries auth)
 *     tags:
 *       - User
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
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
router.get('/', currentUser, isAuth, getAllUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Read current User (Requries auth)
 *     tags:
 *       - User
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
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
router.get('/me', currentUser, isAuth, getCurrentUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Read user by id (Requries auth)
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the User to retrieve.
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
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
router.get(
  '/:id',
  currentUser,
  isAuth,
  validators.user.getUserById,
  validators.validate,
  getUserById
);

/**
 * @swagger
 * /users/me/email:
 *   patch:
 *     summary: Update current user's email (Requries auth)
 *     tags:
 *       - User
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
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
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
router.patch(
  '/me/email',
  currentUser,
  isAuth,
  validators.user.updateCurrentUserEmail,
  validators.validate,
  updateCurrentUserEmail
);

/**
 * @swagger
 * /users/{id}/email:
 *   patch:
 *     summary: Update user's email by id (Requries auth)
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the User to update.
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
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
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
router.patch(
  '/:id/email',
  currentUser,
  isAuth,
  validators.user.updateUserEmailById,
  validators.validate,
  updateUserEmailById
);

/**
 * @swagger
 * /users/{id}/email:
 *   patch:
 *     summary: Update user's email by id (Requries auth)
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 format: password
 *               oldPassword:
 *                 type: string
 *                 description: The old password of the user.
 *             required:
 *               - password
 *               - oldPassword
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
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
router.patch(
  '/me/password',
  currentUser,
  isAuth,
  validators.user.updateCurrentUserPassword,
  validators.validate,
  updateCurrentUserPassword
);

/**
 * @swagger
 * /users/{id}/email:
 *   patch:
 *     summary: Update user's email by id (Requries auth)
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the User to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 format: password
 *             required:
 *               - password
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
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
router.patch(
  '/:id/password',
  currentUser,
  isAuth,
  validators.user.updateUserPasswordById,
  validators.validate,
  updateUserPasswordById
);

/**
 * @swagger
 * /users/me/avatar:
 *   patch:
 *     summary: NOT IMPLEMENTED YET!! Update current user's avatar (Requries auth)
 *     tags:
 *       - User
 */
router.patch('/:id/avatar');

/**
 * @swagger
 * /users/{id}/avatar:
 *   patch:
 *     summary: NOT IMPLEMENTED YET!! Update user's avatar by id (Requries auth)
 *     tags:
 *       - User
 */
router.patch('/:id/avatar');

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete an User by ID (Requries auth)
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the User to delete.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               application/json:
 *                 type: object
 *                 properties:
 *                    message:
 *                      type: string
 *                      example: User deleted successfully
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       '404':
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
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
router.delete(
  '/:id',
  currentUser,
  isAuth,
  validators.user.deleteUser,
  validators.validate,
  deleteUser
);

export default router;
