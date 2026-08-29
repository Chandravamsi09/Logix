/**
 * Attribute-Based Access Control (ABAC) and Fine-Grained Policy Engine
 */

export interface AccessSubject {
  userId: string;
  tenantId: string;
  roles: string[];
  attributes: Record<string, any>;
}

export interface AccessResource {
  type: string;
  id: string;
  tenantId: string;
  ownerId?: string;
  attributes: Record<string, any>;
}

export interface AccessAction {
  name: string; // 'create' | 'read' | 'update' | 'delete' | 'dispatch' | 'cancel'
}

export interface AccessEnvironment {
  ipAddress?: string;
  timeOfDay: string;
  isMfaVerified: boolean;
}

export type PolicyEffect = 'ALLOW' | 'DENY';

export interface PolicyRule {
  id: string;
  description: string;
  effect: PolicyEffect;
  subjectCondition: (subject: AccessSubject) => boolean;
  resourceCondition: (resource: AccessResource, subject: AccessSubject) => boolean;
  actionCondition: (action: AccessAction) => boolean;
}

export class PolicyEngine {
  private rules: PolicyRule[] = [];

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    // SuperAdmin has unconditional access
    this.rules.push({
      id: 'SUPER_ADMIN_ALL_ACCESS',
      description: 'SuperAdmin possesses global administrative privileges',
      effect: 'ALLOW',
      subjectCondition: sub => sub.roles.includes('SUPER_ADMIN'),
      resourceCondition: () => true,
      actionCondition: () => true
    });

    // Multi-tenant strict isolation rule
    this.rules.push({
      id: 'TENANT_ISOLATION_GUARD',
      description: 'Subjects cannot access resources belonging to another tenant',
      effect: 'DENY',
      subjectCondition: sub => !sub.roles.includes('SUPER_ADMIN'),
      resourceCondition: (res, sub) => res.tenantId !== sub.tenantId,
      actionCondition: () => true
    });

    // Tenant Admin full access within tenant
    this.rules.push({
      id: 'TENANT_ADMIN_TENANT_ACCESS',
      description: 'Tenant admins have full read/write capabilities in their tenant',
      effect: 'ALLOW',
      subjectCondition: sub => sub.roles.includes('TENANT_ADMIN'),
      resourceCondition: (res, sub) => res.tenantId === sub.tenantId,
      actionCondition: () => true
    });

    // Driver restricted access to assigned shipments
    this.rules.push({
      id: 'DRIVER_ASSIGNED_SHIPMENT_ACCESS',
      description: 'Drivers can only view and update their own assigned shipments',
      effect: 'ALLOW',
      subjectCondition: sub => sub.roles.includes('DRIVER'),
      resourceCondition: (res, sub) => res.type === 'Shipment' && res.attributes.assignedDriverId === sub.userId,
      actionCondition: action => ['read', 'update_telemetry', 'submit_pod'].includes(action.name)
    });
  }

  public evaluate(
    subject: AccessSubject,
    resource: AccessResource,
    action: AccessAction
  ): { isAllowed: boolean; matchedRuleId?: string; reason: string } {
    // Deny-first evaluation logic
    for (const rule of this.rules) {
      if (
        rule.subjectCondition(subject) &&
        rule.resourceCondition(resource, subject) &&
        rule.actionCondition(action)
      ) {
        if (rule.effect === 'DENY') {
          return { isAllowed: false, matchedRuleId: rule.id, reason: rule.description };
        }
        if (rule.effect === 'ALLOW') {
          return { isAllowed: true, matchedRuleId: rule.id, reason: rule.description };
        }
      }
    }

    return { isAllowed: false, reason: 'Default deny: no matching policy rule granted authorization.' };
  }
}
