export class BaseDomainException extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_DOMAIN_ERROR', details?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

export class NotFoundException extends BaseDomainException {
  constructor(entity: string, id?: string, details?: Record<string, any>) {
    super(
      id ? `${entity} with identifier '${id}' was not found.` : `${entity} was not found.`,
      404,
      'ENTITY_NOT_FOUND',
      { entity, id, ...details }
    );
  }
}

export class ValidationError extends BaseDomainException {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_FAILED', { validationErrors: errors });
  }
}

export class UnauthorizedException extends BaseDomainException {
  constructor(message = 'Authentication token is invalid, missing, or expired.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenException extends BaseDomainException {
  constructor(message = 'You do not possess the required permissions or roles to perform this action.') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictException extends BaseDomainException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 409, 'CONFLICT_STATE', details);
  }
}

export class InsufficientInventoryException extends BaseDomainException {
  constructor(sku: string, requestedQty: number, availableQty: number) {
    super(
      `Insufficient inventory for SKU '${sku}'. Requested: ${requestedQty}, Available: ${availableQty}.`,
      422,
      'INSUFFICIENT_INVENTORY',
      { sku, requestedQty, availableQty }
    );
  }
}

export class PaymentProcessingException extends BaseDomainException {
  constructor(reason: string, transactionId?: string) {
    super(
      `Payment processing failed: ${reason}`,
      402,
      'PAYMENT_FAILED',
      { reason, transactionId }
    );
  }
}

export class SagaExecutionException extends BaseDomainException {
  constructor(sagaId: string, failedStep: string, reason: string) {
    super(
      `Saga '${sagaId}' execution failed at step '${failedStep}': ${reason}`,
      500,
      'SAGA_EXECUTION_ERROR',
      { sagaId, failedStep, reason }
    );
  }
}

export class UnbalancedLedgerException extends BaseDomainException {
  constructor(totalDebits: number, totalCredits: number) {
    super(
      `Double-entry ledger invariant violated: Debits (${totalDebits}) do not equal Credits (${totalCredits}).`,
      422,
      'UNBALANCED_LEDGER_TRANSACTION',
      { totalDebits, totalCredits, imbalance: Math.abs(totalDebits - totalCredits) }
    );
  }
}

export class RateLimitExceededException extends BaseDomainException {
  constructor(limit: number, windowSeconds: number) {
    super(
      `API rate limit exceeded. Max ${limit} requests per ${windowSeconds} seconds allowed.`,
      429,
      'RATE_LIMIT_EXCEEDED',
      { limit, windowSeconds }
    );
  }
}
