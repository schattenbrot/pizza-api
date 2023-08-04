import mongoose from 'mongoose';
import environment from './environment.config';

const { DATABASE_PROTOCOL, DATABASE_URL, DATABASE_PORT, DATABASE_NAME } =
  environment;

export const connectDatabase = () =>
  mongoose.connect(
    `${DATABASE_PROTOCOL}://${DATABASE_URL}:${DATABASE_PORT}/${DATABASE_NAME}`
  );
