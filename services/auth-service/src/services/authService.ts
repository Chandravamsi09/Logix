import { UserRepository, TenantRepository, AuditLogRepository } from '../repositories/inMemoryRepositories';
import { PasswordHasher } from './passwordHasher';
import { TokenService, AuthTokens } from './tokenService';
import { RegisterUserDTO, LoginDTO, CreateTenantDTO } from '../dto/auth.dto';
import { ConflictException, NotFoundException, UnauthorizedException, ForbiddenException, UserRole, TenantTier } from '@nexus/common';

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tenantRepo: TenantRepository,
    private readonly auditRepo: AuditLogRepository
  ) {}

  async registerUser(dto: RegisterUserDTO, ipAddress?: string): Promise<{ user: any; tokens: AuthTokens }> {
    const tenant = await this.tenantRepo.findById(dto.tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant', dto.tenantId);
    }
    if (!tenant.isActive) {
      throw new ForbiddenException('The requested tenant organization is currently inactive.');
    }

    const existing = await this.userRepo.findByEmailAndTenant(dto.email, dto.tenantId);
    if (existing) {
      throw new ConflictException(`A user with email '${dto.email}' already exists in this tenant.`);
    }

    const passwordHash = await PasswordHasher.hash(dto.password);
    const user = await this.userRepo.create({
      tenantId: dto.tenantId,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles,
      permissions: ['orders:read', 'orders:create', 'inventory:read'],
      isActive: true,
      isEmailVerified: false,
      failedLoginAttempts: 0
    });

    const tokens = TokenService.generateAuthTokens(user);

    await this.auditRepo.record({
      tenantId: dto.tenantId,
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user.id,
      ipAddress
    });

    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles
      },
      tokens
    };
  }

  async login(dto: LoginDTO, ipAddress?: string): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await this.userRepo.findByEmailAndTenant(dto.email, dto.tenantId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email, tenant or password credentials.');
    }

    const isValid = await PasswordHasher.verify(dto.password, user.passwordHash);
    if (!isValid) {
      await this.userRepo.update(user.id, {
        failedLoginAttempts: user.failedLoginAttempts + 1
      });
      throw new UnauthorizedException('Invalid email, tenant or password credentials.');
    }

    await this.userRepo.update(user.id, {
      failedLoginAttempts: 0,
      lastLoginAt: new Date()
    });

    const tokens = TokenService.generateAuthTokens(user);

    await this.auditRepo.record({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'USER_LOGGED_IN',
      resource: 'Auth',
      resourceId: user.id,
      ipAddress
    });

    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles
      },
      tokens
    };
  }

  async provisionTenant(dto: CreateTenantDTO): Promise<{ tenant: any; adminUser: any }> {
    const existing = await this.tenantRepo.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(`Tenant slug '${dto.slug}' is already taken.`);
    }

    const tenant = await this.tenantRepo.create({
      name: dto.name,
      slug: dto.slug,
      tier: dto.tier,
      maxUsers: dto.tier === TenantTier.ENTERPRISE ? 5000 : 50,
      maxWarehouses: dto.tier === TenantTier.ENTERPRISE ? 100 : 5,
      isActive: true,
      settings: {
        allowSelfRegistration: false,
        requireMfa: dto.tier === TenantTier.ENTERPRISE,
        sessionTimeoutMinutes: 60
      }
    });

    const passwordHash = await PasswordHasher.hash(dto.adminPassword);
    const adminUser = await this.userRepo.create({
      tenantId: tenant.id,
      email: dto.adminEmail,
      passwordHash,
      firstName: dto.adminFirstName,
      lastName: dto.adminLastName,
      roles: [UserRole.TENANT_ADMIN, UserRole.OPERATIONS_MANAGER],
      permissions: ['*'],
      isActive: true,
      isEmailVerified: true,
      failedLoginAttempts: 0
    });

    return { tenant, adminUser };
  }
}
