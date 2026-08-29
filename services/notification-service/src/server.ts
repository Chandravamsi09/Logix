import { createNotificationApp } from './app';
import { notificationConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('NotificationServer');
const app = createNotificationApp();

const server = app.listen(notificationConfig.PORT, notificationConfig.HOST, () => {
  logger.info(`Logix Notification Service active on port ${notificationConfig.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Notification service terminated gracefully.');
    process.exit(0);
  });
});
