import { z } from 'zod';

const gatewayEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGINS: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),
  JWT_ACCESS_SECRET: z.string().default('dev_jwt_access_secret_logix_enterprise_32bytes'),
  
  // Upstream Microservice URLs
  AUTH_SERVICE_URL: z.string().default('http://localhost:4001'),
  ORDER_SERVICE_URL: z.string().default('http://localhost:4002'),
  INVENTORY_SERVICE_URL: z.string().default('http://localhost:4003'),
  LOGISTICS_SERVICE_URL: z.string().default('http://localhost:4004'),
  BILLING_SERVICE_URL: z.string().default('http://localhost:4005'),
  NOTIFICATION_SERVICE_URL: z.string().default('http://localhost:4006'),
  ANALYTICS_SERVICE_URL: z.string().default('http://localhost:4007'),
  
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional()
});

export const gatewayConfig = gatewayEnvSchema.parse(process.env);
