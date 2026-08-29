import { z } from 'zod';

const logisticsEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4004),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1).default(process.env.DATABASE_URL || 'postgresql://localhost:5434/logix_logistics?schema=public'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672')
});

export const logisticsConfig = logisticsEnvSchema.parse(process.env);
