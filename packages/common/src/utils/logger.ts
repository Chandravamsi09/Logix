export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  service?: string;
  tenantId?: string;
  correlationId?: string;
  userId?: string;
  [key: string]: any;
}

export class Logger {
  constructor(private readonly serviceName: string) {}

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const logPayload = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: this.serviceName,
      message,
      ...context
    };
    return JSON.stringify(logPayload);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    const errorDetails = error instanceof Error ? {
      errorMessage: error.message,
      stack: error.stack,
      errorName: error.name
    } : { rawError: error };

    console.error(this.formatMessage('error', message, { ...context, ...errorDetails }));
  }
}
