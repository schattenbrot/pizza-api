import { PORT, SERVER } from './config/environment.config';
import app from './config/app.config';
import './config/mongoose.config';
import logger from './utils/logger';

app.listen(PORT);
logger.info(`Api available at: http://${SERVER}:${PORT}/api`);
