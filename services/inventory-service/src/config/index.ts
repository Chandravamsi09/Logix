import { z } from 'zod';

const inventoryEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4003),
  HOST: z.string().default('0.0.0.0'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/logix_inventory'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672')
});

export const inventoryConfig = inventoryEnvSchema.parse(process.env);
