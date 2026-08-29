import { z } from 'zod';

const authEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4001),
  HOST: z.string().default('0.0.0.0'),
  JWT_ACCESS_SECRET: z.string().default('dev_jwt_access_secret_logix_enterprise_32bytes'),
  JWT_REFRESH_SECRET: z.string().default('dev_jwt_refresh_secret_logix_enterprise_32bytes'),
  JWT_ACCESS_EXPIRATION: z.string().default('900s'), // 15 mins
  JWT_REFRESH_EXPIRATION: z.string().default('604800s'), // 7 days
  DATABASE_URL: z.string().default('postgresql://postgres:postgres_password@localhost:5432/logix_auth?schema=public'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379)
});

export const authConfig = authEnvSchema.parse(process.env);
