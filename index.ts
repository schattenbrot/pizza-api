import mongoose from 'mongoose';

import { PORT } from './api/utils/environment';
import app from './api/utils/express';
import './api/utils/mongoose';
import logger from './api/utils/logger';

app.listen(PORT);
logger.info('Listening on port', PORT);
