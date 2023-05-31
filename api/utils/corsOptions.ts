import { NODE_ENV, SERVER } from './environment';
import logger from './logger';

const protocol = NODE_ENV === 'production' ? 'https' : 'http';
const origin = `${protocol}://${SERVER}`;

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
