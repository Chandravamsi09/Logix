import { z } from 'zod';
import { ValidationError } from '../errors';

export class ValidationUtils {
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') || 'root';
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }
      throw new ValidationError('Input validation failed against schema rules.', fieldErrors);
    }
    return result.data;
  }

  static sanitizeString(input: string): string {
    return input.replace(/<[^>]*>?/gm, '').trim();
  }
}
