import { createBillingApp } from './app';
import { billingConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('BillingServer');
const app = createBillingApp();

const server = app.listen(billingConfig.PORT, billingConfig.HOST, () => {
  logger.info(`Logix Billing Service active on port ${billingConfig.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Billing service terminated gracefully.');
    process.exit(0);
  });
});
