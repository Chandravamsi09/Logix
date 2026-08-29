import { createOrderApp } from './app';
import { orderConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('OrderServer');
const app = createOrderApp();

const server = app.listen(orderConfig.PORT, orderConfig.HOST, () => {
  logger.info(`Logix Order Service active on port ${orderConfig.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Order service terminated gracefully.');
    process.exit(0);
  });
});
