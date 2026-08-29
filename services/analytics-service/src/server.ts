import { createAnalyticsApp } from './app';
import { analyticsConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('AnalyticsServer');
const app = createAnalyticsApp();

const server = app.listen(analyticsConfig.PORT, analyticsConfig.HOST, () => {
  logger.info(`Logix Analytics Service active on port ${analyticsConfig.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Analytics service terminated gracefully.');
    process.exit(0);
  });
});
