import { CORS_ORIGIN } from './environment';
import logger from './logger';

const origin = CORS_ORIGIN;

const corsOptions = {
  origin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length'],
  credentials: true,
  maxAge: 12 * 3600,
};

logger.info(`The configured server origin is: ${origin}`);

export default corsOptions;
