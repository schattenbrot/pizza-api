import { PORT, SERVER } from './config/environment.config';
import app from './config/app.config';
import logger from './utils/logger';
import { connectDatabase } from './config/mongoose.config';

connectDatabase().then(() => {
  app.listen(PORT);

  logger.info(`API available at: http://${SERVER}:${PORT}/api`);
  logger.info(`DOCS available at: http://${SERVER}:${PORT}/docs`);
});
