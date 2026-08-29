import { z } from 'zod';
import { UserRole, TenantTier } from '@nexus/common';

export const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
  firstName: z.string().min(1, 'First name is required.').max(100),
  lastName: z.string().min(1, 'Last name is required.').max(100),
  tenantId: z.string().uuid('Tenant ID must be a valid UUID.'),
  roles: z.array(z.nativeEnum(UserRole)).default([UserRole.CUSTOMER])
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z.string().min(1, 'Password cannot be empty.'),
  tenantId: z.string().uuid('Tenant ID must be a valid UUID.')
});

export type LoginDTO = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required.')
});

export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;

export const CreateTenantSchema = z.object({
  name: z.string().min(2, 'Tenant name must have at least 2 characters.').max(150),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens.'),
  tier: z.nativeEnum(TenantTier).default(TenantTier.STARTER),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  adminFirstName: z.string().min(1),
  adminLastName: z.string().min(1)
});

export type CreateTenantDTO = z.infer<typeof CreateTenantSchema>;
