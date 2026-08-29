import { Request, Response, NextFunction } from 'express';
import { RateLimitExceededException } from '@nexus/common';
import { gatewayConfig } from '../config';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class InMemoryRateLimiter {
  private readonly hits = new Map<string, RateLimitRecord>();

  constructor(
    private readonly windowMs: number = gatewayConfig.RATE_LIMIT_WINDOW_MS,
    private readonly maxRequests: number = gatewayConfig.RATE_LIMIT_MAX_REQUESTS
  ) {
    setInterval(() => this.cleanup(), windowMs);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (now > record.resetTime) {
        this.hits.delete(key);
      }
    }
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
      const key = `rate_limit:${clientIp}`;
      const now = Date.now();

      let record = this.hits.get(key);
      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs
        };
        this.hits.set(key, record);
      } else {
        record.count += 1;
      }

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - record.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      if (record.count > this.maxRequests) {
        throw new RateLimitExceededException(this.maxRequests, Math.round(this.windowMs / 1000));
      }

      next();
    };
  }
}

export const rateLimiter = new InMemoryRateLimiter();
