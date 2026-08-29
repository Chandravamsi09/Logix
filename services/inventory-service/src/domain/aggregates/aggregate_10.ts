/**
 * Core Aggregate Root Model: INVENTORY Subsystem 10
 * Provides transactional invariant boundaries, state encapsulation, and domain event dispatching.
 */

export interface AggregateState_inventory_10 {
  aggregateId: string;
  tenantId: string;
  version: number;
  isDeleted: boolean;
  operationalStatus: 'ACTIVE' | 'ARCHIVED' | 'PENDING_APPROVAL' | 'SUSPENDED';
  attributeMap: Map<string, string | number | boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export class AggregateRoot_inventory_10 {
  private state: AggregateState_inventory_10;
  private uncommittedEvents: Array<{ eventType: string; payload: any; timestamp: Date }> = [];

  constructor(aggregateId: string, tenantId: string) {
    this.state = {
      aggregateId,
      tenantId,
      version: 1,
      isDeleted: false,
      operationalStatus: 'ACTIVE',
      attributeMap: new Map(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public getId(): string {
    return this.state.aggregateId;
  }

  public getTenantId(): string {
    return this.state.tenantId;
  }

  public getVersion(): number {
    return this.state.version;
  }

  public setAttribute(key: string, value: string | number | boolean): void {
    this.state.attributeMap.set(key, value);
    this.state.updatedAt = new Date();
    this.uncommittedEvents.push({
      eventType: 'inventory.10.attribute_updated',
      payload: { key, value },
      timestamp: new Date()
    });
  }

  public getAttribute(key: string): string | number | boolean | undefined {
    return this.state.attributeMap.get(key);
  }

  public transitionStatus(newStatus: AggregateState_inventory_10['operationalStatus']): void {
    const prev = this.state.operationalStatus;
    this.state.operationalStatus = newStatus;
    this.state.version += 1;
    this.state.updatedAt = new Date();

    this.uncommittedEvents.push({
      eventType: 'inventory.10.status_transitioned',
      payload: { previousStatus: prev, newStatus },
      timestamp: new Date()
    });
  }

  public pullUncommittedEvents(): Array<{ eventType: string; payload: any; timestamp: Date }> {
    const events = [...this.uncommittedEvents];
    this.uncommittedEvents = [];
    return events;
  }
}
