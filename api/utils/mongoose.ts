import mongoose from 'mongoose';
import environment from './environment';
import logger from './logger';

const { DATABASE_PROTOCOL, DATABASE_URL, DATABASE_PORT, DATABASE_NAME } =
  environment;

mongoose
  .connect(
    `${DATABASE_PROTOCOL}://${DATABASE_URL}:${DATABASE_PORT}/${DATABASE_NAME}`
  )
  .catch(error =>
    logger.error('An error occurred while connecting to the database')
  );
