import { z } from 'zod';

export const DateRangeQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD').optional(),
  tenantId: z.string().uuid().optional()
});

export type DateRangeQueryDTO = z.infer<typeof DateRangeQuerySchema>;
