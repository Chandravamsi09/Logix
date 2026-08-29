import { z } from 'zod';

const analyticsEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4007),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres_password@localhost:5436/logix_analytics?schema=public'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672')
});

export const analyticsConfig = analyticsEnvSchema.parse(process.env);
