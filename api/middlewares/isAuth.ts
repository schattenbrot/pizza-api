import { RequestHandler } from 'express';
import createHttpError from 'http-errors';

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const isAuth: RequestHandler = (req, res, next) => {
  if (!req.currentUser) {
    throw createHttpError(401, 'Unauthorized');
  }
  next();
};
