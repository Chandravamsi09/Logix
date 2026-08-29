import { PasswordHasher } from '../../services/auth-service/src/services/passwordHasher';
import { UserRepository, TenantRepository, AuditLogRepository } from '../../services/auth-service/src/repositories/inMemoryRepositories';
import { AuthService } from '../../services/auth-service/src/services/authService';
import { UserRole, TenantTier } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

describe('Auth & IAM Service Test Suite', () => {
  let userRepo: UserRepository;
  let tenantRepo: TenantRepository;
  let auditRepo: AuditLogRepository;
  let authService: AuthService;
  let tenantId: string;

  beforeEach(async () => {
    userRepo = new UserRepository();
    tenantRepo = new TenantRepository();
    auditRepo = new AuditLogRepository();
    authService = new AuthService(userRepo, tenantRepo, auditRepo);

    const tenant = await tenantRepo.create({
      name: 'Acme Logistics Corp',
      slug: 'acme-logistics',
      tier: TenantTier.ENTERPRISE,
      maxUsers: 100,
      maxWarehouses: 10,
      isActive: true,
      settings: { allowSelfRegistration: false, requireMfa: true, sessionTimeoutMinutes: 60 }
    });
    tenantId = tenant.id;
  });

  test('TC-01: PasswordHasher should securely hash and verify passwords using PBKDF2 with SHA-512', async () => {
    const password = 'StrongPassword@2026!';
    const hash = await PasswordHasher.hash(password);
    expect(hash).toContain(':');
    
    const isValid = await PasswordHasher.verify(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await PasswordHasher.verify('WrongPassword123!', hash);
    expect(isInvalid).toBe(false);
  });

  test('TC-02: Registering a new tenant user should return valid user metadata and JWT tokens', async () => {
    const result = await authService.registerUser({
      email: 'operator@acme.com',
      password: 'SecureOperator@2026',
      firstName: 'Jane',
      lastName: 'Doe',
      tenantId,
      roles: [UserRole.OPERATIONS_MANAGER]
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('operator@acme.com');
    expect(result.user.roles).toContain(UserRole.OPERATIONS_MANAGER);
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  test('TC-03: Login with invalid credentials should be rejected with UnauthorizedException', async () => {
    await authService.registerUser({
      email: 'driver@acme.com',
      password: 'DriverPassword@123',
      firstName: 'John',
      lastName: 'Smith',
      tenantId,
      roles: [UserRole.DRIVER]
    });

    await expect(authService.login({
      email: 'driver@acme.com',
      password: 'IncorrectPassword',
      tenantId
    })).rejects.toThrow();
  });
});
