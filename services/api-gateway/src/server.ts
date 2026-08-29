import { createGatewayApp } from './app';
import { gatewayConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('GatewayServer');
const app = createGatewayApp();

const server = app.listen(gatewayConfig.PORT, gatewayConfig.HOST, () => {
  logger.info(`Logix API Gateway running securely on http://${gatewayConfig.HOST}:${gatewayConfig.PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Gracefully closing Gateway HTTP server...');
  server.close(() => {
    logger.info('Gateway server closed.');
    process.exit(0);
  });
});
