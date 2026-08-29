import { Request, Response, NextFunction } from 'express';
import { BaseDomainException, Logger } from '@nexus/common';

const logger = new Logger('GatewayErrorHandler');

export const gatewayErrorHandler = (
  err: Error | BaseDomainException,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const correlationId = (req.headers['x-correlation-id'] as string) || 'unknown';

  if (err instanceof BaseDomainException) {
    logger.warn(`Domain error [${err.code}] at ${req.method} ${req.url}`, {
      correlationId,
      statusCode: err.statusCode,
      details: err.details
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: err.timestamp,
        correlationId
      }
    });
    return;
  }

  logger.error(`Unhandled Gateway Exception at ${req.method} ${req.url}`, err, { correlationId });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_GATEWAY_ERROR',
      message: 'An unexpected internal error occurred in the API Gateway.',
      correlationId,
      timestamp: new Date().toISOString()
    }
  });
};
