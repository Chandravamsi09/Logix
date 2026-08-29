import { InMemoryRateLimiter } from '../../services/api-gateway/src/middleware/rateLimiter';
import { CircuitBreaker, CircuitState } from '../../services/api-gateway/src/services/circuitBreaker';

describe('API Gateway & Resilience Test Suite', () => {
  test('TC-09: CircuitBreaker should trip to OPEN after consecutive failures', () => {
    const breaker = new CircuitBreaker('test-service', 3, 5000);
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    expect(breaker.canPass()).toBe(true);

    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe(CircuitState.CLOSED);

    breaker.recordFailure(); // 3rd failure trips
    expect(breaker.getState()).toBe(CircuitState.OPEN);
    expect(breaker.canPass()).toBe(false);
  });

  test('TC-10: InMemoryRateLimiter should provide middleware handler', () => {
    const limiter = new InMemoryRateLimiter(60000, 100);
    const middleware = limiter.middleware();
    expect(typeof middleware).toBe('function');
  });
});
