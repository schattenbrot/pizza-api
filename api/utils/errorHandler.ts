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
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpError) {
    logger.error(
      `${err.status}/${err.name} - ${err.message}${
        NODE_ENV === 'development' ? ` ${err.stack}` : ''
      }`
    );

    return res.status(err.status).json({
      statusCode: err.status,
      message: err.message,
      stack: NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  res.status(500).json({
    statusCode: 500,
    message: 'Internal Server Error',
    stack: err.stack,
  });
};

export default errorHandler;
