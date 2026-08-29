import { z } from 'zod';

const billingEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4005),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres_password@localhost:5435/logix_billing?schema=public'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672')
});

export const billingConfig = billingEnvSchema.parse(process.env);
