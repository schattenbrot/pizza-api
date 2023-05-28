import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import { NODE_ENV } from './environment';
import logger from './logger';

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
