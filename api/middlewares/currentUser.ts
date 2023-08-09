import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/environment.config';

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

export const currentUser: RequestHandler = (req, res, next) => {
  const { session } = req;
  if (!session!.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(session!.jwt, JWT_SECRET) as UserPayload;
    req.currentUser = payload;
  } catch (err) {} // ignore errors

  next();
};
