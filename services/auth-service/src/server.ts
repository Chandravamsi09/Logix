import { createAuthApp } from './app';
import { authConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('AuthServer');
const app = createAuthApp();

const server = app.listen(authConfig.PORT, authConfig.HOST, () => {
  logger.info(`Logix Auth & IAM Service active on port ${authConfig.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Auth service terminated gracefully.');
    process.exit(0);
  });
});
