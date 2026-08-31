/**
 * SCIM 2.0 (System for Cross-domain Identity Management - RFC 7644) Protocol Engine
 * Handles enterprise Okta, Azure AD, and PingFederate automated user & group provisioning.
 */

export interface IScimUserResource {
  schemas: string[];
  id: string;
  externalId?: string;
  userName: string;
  name: {
    formatted: string;
    familyName: string;
    givenName: string;
    middleName?: string;
  };
  emails: Array<{ value: string; type: string; primary: boolean }>;
  phoneNumbers?: Array<{ value: string; type: string }>;
  roles: Array<{ value: string; display?: string; primary?: boolean }>;
  active: boolean;
  meta: {
    resourceType: string;
    created: Date;
    lastModified: Date;
    location: string;
    version: string;
  };
}

export interface IScimFilterQuery {
  filter?: string;
  startIndex?: number;
  count?: number;
  sortBy?: string;
  sortOrder?: 'ascending' | 'descending';
}

export class ScimUserProvisioningProtocolEngine {
  private readonly userDatabase = new Map<string, IScimUserResource>();

  public createUser(tenantId: string, payload: Omit<IScimUserResource, 'id' | 'meta'>): IScimUserResource {
    const id = 'scim_usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date();
    
    const user: IScimUserResource = {
      ...payload,
      id,
      meta: {
        resourceType: 'User',
        created: now,
        lastModified: now,
        location: `/scim/v2/Users/${id}`,
        version: 'W/"' + Date.now() + '"'
      }
    };

    this.userDatabase.set(id, user);
    return user;
  }

  public updateUser(id: string, updates: Partial<IScimUserResource>): IScimUserResource {
    const existing = this.userDatabase.get(id);
    if (!existing) {
      throw new Error(`SCIM User ${id} not found`);
    }

    const updated: IScimUserResource = {
      ...existing,
      ...updates,
      meta: {
        ...existing.meta,
        lastModified: new Date(),
        version: 'W/"' + Date.now() + '"'
      }
    };

    this.userDatabase.set(id, updated);
    return updated;
  }

  public patchUser(id: string, operations: Array<{ op: 'add' | 'remove' | 'replace'; path?: string; value: any }>): IScimUserResource {
    const existing = this.userDatabase.get(id);
    if (!existing) {
      throw new Error(`SCIM User ${id} not found`);
    }

    operations.forEach(op => {
      if (op.op === 'replace' && op.path === 'active') {
        existing.active = Boolean(op.value);
      } else if (op.op === 'replace' && op.path === 'roles') {
        existing.roles = Array.isArray(op.value) ? op.value : [op.value];
      }
    });

    existing.meta.lastModified = new Date();
    existing.meta.version = 'W/"' + Date.now() + '"';
    return existing;
  }

  public queryUsers(query: IScimFilterQuery): { totalResults: number; startIndex: number; itemsPerPage: number; Resources: IScimUserResource[] } {
    const startIndex = query.startIndex || 1;
    const count = query.count || 50;

    let users = Array.from(this.userDatabase.values());

    if (query.filter) {
      if (query.filter.includes('userName eq')) {
        const target = query.filter.split('"')[1] || '';
        users = users.filter(u => u.userName.toLowerCase() === target.toLowerCase());
      }
    }

    const totalResults = users.length;
    const paginated = users.slice(startIndex - 1, startIndex - 1 + count);

    return {
      totalResults,
      startIndex,
      itemsPerPage: paginated.length,
      Resources: paginated
    };
  }

  public deleteUser(id: string): boolean {
    return this.userDatabase.delete(id);
  }
}
