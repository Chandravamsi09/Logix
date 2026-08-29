import { createInventoryApp } from './app';
import { inventoryConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('InventoryServer');
const app = createInventoryApp();

const server = app.listen(inventoryConfig.PORT, inventoryConfig.HOST, () => {
  logger.info(`Logix Inventory Service active on port ${inventoryConfig.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Inventory service terminated gracefully.');
    process.exit(0);
  });
});
