import { createLogisticsApp } from './app';
import { logisticsConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('LogisticsServer');
const app = createLogisticsApp();

const server = app.listen(logisticsConfig.PORT, logisticsConfig.HOST, () => {
  logger.info(`Logix Fleet & Logistics Service active on port ${logisticsConfig.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Logistics service terminated gracefully.');
    process.exit(0);
  });
});
