import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import { NODE_ENV } from './environment';
import logger from './logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           description: The status code of the error response.
 *           example: 500
 *         message:
 *           type: string
 *           description: The error message.
 *         stack:
 *           type: string
 *           nullable: true
 *           description: The error stack trace (available in development mode only).
 *     ErrorNotFound:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           description: The status code of the error response.
 *           example: 404
 *         message:
 *           type: string
 *           description: The error message.
 *         stack:
 *           type: string
 *           nullable: true
 *           description: The error stack trace (available in development mode only).
 *     ErrorUnprocessableEntity:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           description: The status code of the error response.
 *           example: 422
 *         message:
 *           type: string
 *           description: The error message.
 *           example: 'Invalid value: [body / price] (undefined)'
 *         stack:
 *           type: string
 *           nullable: true
 *           description: The error stack trace (available in development mode only).
 */

const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(
    `${err.status}/${err.name} - ${err.message}${
      NODE_ENV === 'development' ? ` ${err.stack}` : ''
    }`
  );
  res.status(err.status || 500).json({
    statusCode: err.status || 500,
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
