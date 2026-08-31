/**
 * Hierarchical Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) Engine
 */

export interface IRoleDefinition {
  roleId: string;
  roleName: string;
  inheritsFrom?: string[];
  permissions: string[];
  tenantScope: 'GLOBAL' | 'TENANT_SPECIFIC';
}

export interface IAccessEvaluationContext {
  userId: string;
  userRoles: string[];
  tenantId: string;
  targetResource: string;
  targetAction: string;
  resourceTenantId: string;
  isOwner?: boolean;
  environmentAttributes?: Record<string, any>;
}

export class HierarchicalRolePermissionEvaluator {
  private readonly roles = new Map<string, IRoleDefinition>();

  constructor() {
    this.initializeStandardRoles();
  }

  private initializeStandardRoles(): void {
    this.registerRole({
      roleId: 'SUPER_ADMIN',
      roleName: 'Platform Super Administrator',
      permissions: ['*'],
      tenantScope: 'GLOBAL'
    });

    this.registerRole({
      roleId: 'OPERATIONS_MANAGER',
      roleName: 'Operations Center Manager',
      inheritsFrom: ['DISPATCHER', 'INVENTORY_MANAGER'],
      permissions: [
        'order:create', 'order:read', 'order:update', 'order:cancel',
        'inventory:read', 'inventory:adjust', 'inventory:reserve',
        'logistics:dispatch', 'logistics:track', 'logistics:assign_carrier',
        'reports:view', 'reports:export'
      ],
      tenantScope: 'TENANT_SPECIFIC'
    });

    this.registerRole({
      roleId: 'DISPATCHER',
      roleName: 'Fleet Dispatch Officer',
      permissions: [
        'logistics:dispatch', 'logistics:track', 'logistics:update_waypoint', 'logistics:pod_sign'
      ],
      tenantScope: 'TENANT_SPECIFIC'
    });

    this.registerRole({
      roleId: 'INVENTORY_MANAGER',
      roleName: 'Warehouse & Inventory Manager',
      permissions: [
        'inventory:read', 'inventory:adjust', 'inventory:bin_allocate', 'inventory:cycle_count'
      ],
      tenantScope: 'TENANT_SPECIFIC'
    });

    this.registerRole({
      roleId: 'FINANCE_OFFICER',
      roleName: 'Billing & General Ledger Officer',
      permissions: [
        'billing:invoice_create', 'billing:ledger_post', 'billing:reconcile', 'reports:financial_export'
      ],
      tenantScope: 'TENANT_SPECIFIC'
    });

    this.registerRole({
      roleId: 'DRIVER',
      roleName: 'Fleet Vehicle Driver',
      permissions: [
        'logistics:read_assigned', 'logistics:telemetry_ping', 'logistics:pod_upload'
      ],
      tenantScope: 'TENANT_SPECIFIC'
    });
  }

  public registerRole(role: IRoleDefinition): void {
    this.roles.set(role.roleId, role);
  }

  public evaluateAccess(ctx: IAccessEvaluationContext): boolean {
    // Tenant isolation guard
    if (ctx.tenantId !== ctx.resourceTenantId && !ctx.userRoles.includes('SUPER_ADMIN')) {
      return false;
    }

    const effectivePermissions = this.getEffectivePermissions(ctx.userRoles);

    if (effectivePermissions.has('*')) {
      return true;
    }

    const requiredPermission = `${ctx.targetResource}:${ctx.targetAction}`;
    if (effectivePermissions.has(requiredPermission) || effectivePermissions.has(`${ctx.targetResource}:*`)) {
      return true;
    }

    // Owner-based override for standard user actions
    if (ctx.isOwner && (ctx.targetAction === 'read' || ctx.targetAction === 'update')) {
      return true;
    }

    return false;
  }

  private getEffectivePermissions(roleIds: string[]): Set<string> {
    const permissions = new Set<string>();
    const visitedRoles = new Set<string>();

    const traverseRole = (rId: string) => {
      if (visitedRoles.has(rId)) return;
      visitedRoles.add(rId);

      const role = this.roles.get(rId);
      if (!role) return;

      role.permissions.forEach(p => permissions.add(p));
      if (role.inheritsFrom) {
        role.inheritsFrom.forEach(parentRoleId => traverseRole(parentRoleId));
      }
    };

    roleIds.forEach(id => traverseRole(id));
    return permissions;
  }
}
