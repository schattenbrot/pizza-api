import { PORT, SERVER } from './api/config/environment.config';
import app from './api/utils/express';
import './api/config/mongoose';
import logger from './api/utils/logger';

app.listen(PORT);
logger.info(`Api available at: http://${SERVER}:${PORT}/api`);
