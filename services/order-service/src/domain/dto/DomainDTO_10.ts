import { z } from 'zod';

export const CreateDomainSchema_orders_10 = z.object({
  tenantId: z.string().uuid(),
  code: z.string().min(3).max(50),
  displayName: z.string().min(2).max(200),
  priorityScore: z.number().int().min(0).max(1000).default(100),
  tags: z.array(z.string()).default([]),
  customAttributes: z.record(z.union([z.string(), z.number(), z.boolean()])).default({})
});

export type CreateDomainDTO_orders_10 = z.infer<typeof CreateDomainSchema_orders_10>;

export const UpdateDomainSchema_orders_10 = z.object({
  displayName: z.string().min(2).max(200).optional(),
  priorityScore: z.number().int().min(0).max(1000).optional(),
  operationalStatus: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'PENDING_REVIEW']).optional(),
  tags: z.array(z.string()).optional(),
  customAttributes: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

export type UpdateDomainDTO_orders_10 = z.infer<typeof UpdateDomainSchema_orders_10>;

export const QueryDomainFilterSchema_orders_10 = z.object({
  tenantId: z.string().uuid().optional(),
  operationalStatus: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'PENDING_REVIEW']).optional(),
  minPriority: z.coerce.number().optional(),
  maxPriority: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20)
});

export type QueryDomainFilterDTO_orders_10 = z.infer<typeof QueryDomainFilterSchema_orders_10>;
