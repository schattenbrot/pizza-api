import logger from '../utils/logger';

type Env = 'production' | 'development';

type Environment = {
  NODE_ENV: Env;
  SERVER: string;
  PORT: number;
  CORS_ORIGIN: string;
  DATABASE_PROTOCOL: string;
  DATABASE_URL: string;
  DATABASE_PORT: number;
  DATABASE_NAME: string;
  JWT_SECRET: string;
  AUTH?: {
    DATABASE_USER: string;
    DATABASE_PASSWORD: string;
  };
};

export const SERVER = process.env.SERVER ?? 'localhost';
export const NODE_ENV = (process.env.NODE_ENV as Env) ?? 'development';
export const PORT = parseInt(process.env.PORT ?? '8080');
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';
export const DATABASE_PROTOCOL = process.env.DATABASE_PROTOCOL ?? 'mongodb';
export const DATABASE_URL = process.env.DATABASE_URL ?? 'localhost';
export const DATABASE_PORT = parseInt(process.env.DATABASE_PORT ?? '27017');
export const DATABASE_NAME = process.env.DATABASE_NAME ?? 'pizzaShop';
export const DATABASE_USER = process.env.DATABASE_USER;
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
export const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';

const environment: Environment = {
  NODE_ENV,
  SERVER,
  PORT,
  CORS_ORIGIN,
  DATABASE_PROTOCOL,
  DATABASE_URL,
  DATABASE_PORT,
  DATABASE_NAME,
  JWT_SECRET,
};

if (DATABASE_USER && DATABASE_PASSWORD) {
  environment.AUTH = {
    DATABASE_USER,
    DATABASE_PASSWORD,
  };
}

logger.info(`The server is running with current configuration: ${NODE_ENV}`);

export default environment;
