import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const consoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Set the minimum log level
  format: winston.format.combine(
    winston.format.errors({ stack: true }), // Optional: Include error stack traces in logs
    winston.format.splat()
  ),
  transports: [
    new winston.transports.Console({ format: consoleFormat }), // Output logs to the console
    new DailyRotateFile({
      filename: 'logs/pizza-api-%DATE%.log',
      datePattern: 'YYYY-MM',
      format: fileFormat,
      maxSize: '20m', // Optional: Define the maximum size of each log file
      maxFiles: '1m', // Optional: Define the number of log files to keep
    }),
  ],
});

export default logger;
