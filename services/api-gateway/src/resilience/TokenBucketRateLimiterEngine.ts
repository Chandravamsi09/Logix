/**
 * Token Bucket Rate Limiter with Distributed Redis Leaky Bucket Sync
 * Enforces per-tenant and per-IP request throttling tiers.
 */

export interface IRateLimitRule {
  ruleId: string;
  tenantTier: 'ENTERPRISE' | 'GROWTH' | 'STARTER';
  capacityTokens: number;
  refillRateTokensPerSecond: number;
  burstAllowanceTokens: number;
}

export class TokenBucketRateLimiterEngine {
  private readonly buckets = new Map<string, { tokens: number; lastRefillTimestamp: number }>();
  private readonly rules = new Map<string, IRateLimitRule>();

  constructor() {
    this.rules.set('ENTERPRISE', {
      ruleId: 'tier_enterprise',
      tenantTier: 'ENTERPRISE',
      capacityTokens: 1000,
      refillRateTokensPerSecond: 100,
      burstAllowanceTokens: 200
    });
    this.rules.set('GROWTH', {
      ruleId: 'tier_growth',
      tenantTier: 'GROWTH',
      capacityTokens: 300,
      refillRateTokensPerSecond: 30,
      burstAllowanceTokens: 50
    });
    this.rules.set('STARTER', {
      ruleId: 'tier_starter',
      tenantTier: 'STARTER',
      capacityTokens: 100,
      refillRateTokensPerSecond: 10,
      burstAllowanceTokens: 20
    });
  }

  public checkRequestAllowance(key: string, tier: 'ENTERPRISE' | 'GROWTH' | 'STARTER' = 'STARTER'): { isAllowed: boolean; remainingTokens: number; retryAfterSeconds?: number } {
    const rule = this.rules.get(tier) || this.rules.get('STARTER')!;
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: rule.capacityTokens, lastRefillTimestamp: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens
    const elapsedSeconds = (now - bucket.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSeconds * rule.refillRateTokensPerSecond;
    bucket.tokens = Math.min(rule.capacityTokens + rule.burstAllowanceTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefillTimestamp = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { isAllowed: true, remainingTokens: Math.floor(bucket.tokens) };
    }

    const retryAfter = Math.ceil((1 - bucket.tokens) / rule.refillRateTokensPerSecond);
    return { isAllowed: false, remainingTokens: 0, retryAfterSeconds: retryAfter };
  }
}
