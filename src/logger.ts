import { CONFIG } from './config';
import * as pino from 'pino';

export const logger = pino({
  level: CONFIG.LOG_LEVEL,
});
