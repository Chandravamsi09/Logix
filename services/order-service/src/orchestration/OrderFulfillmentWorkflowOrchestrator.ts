/**
 * Distributed Order Fulfillment Workflow Orchestrator
 * Coordinates order processing state machines across multi-channel sales and multi-node distribution centers.
 */

export interface IFulfillmentStep {
  stepId: string;
  stepName: string;
  serviceTarget: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';
  startTime?: Date;
  completionTime?: Date;
  retryCount: number;
  outputPayload?: Record<string, any>;
  errorMessage?: string;
}

export interface IOrderFulfillmentContext {
  fulfillmentWorkflowId: string;
  orderId: string;
  tenantId: string;
  customerId: string;
  destinationWarehouseId: string;
  steps: IFulfillmentStep[];
  overallStatus: 'INITIALIZED' | 'PROCESSING' | 'FULFILLED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export class OrderFulfillmentWorkflowOrchestrator {
  private readonly workflows = new Map<string, IOrderFulfillmentContext>();

  public initializeWorkflow(orderId: string, tenantId: string, customerId: string, warehouseId: string): IOrderFulfillmentContext {
    const workflowId = 'FWF-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const steps: IFulfillmentStep[] = [
      { stepId: 'step_1', stepName: 'VALIDATE_ORDER_INTEGRITY', serviceTarget: 'order-service', status: 'PENDING', retryCount: 0 },
      { stepId: 'step_2', stepName: 'RESERVE_INVENTORY_STOCK', serviceTarget: 'inventory-service', status: 'PENDING', retryCount: 0 },
      { stepId: 'step_3', stepName: 'AUTHORIZE_CUSTOMER_PAYMENT', serviceTarget: 'billing-service', status: 'PENDING', retryCount: 0 },
      { stepId: 'step_4', stepName: 'DISPATCH_CARRIER_SHIPMENT', serviceTarget: 'logistics-service', status: 'PENDING', retryCount: 0 },
      { stepId: 'step_5', stepName: 'SEND_DISPATCH_NOTIFICATIONS', serviceTarget: 'notification-service', status: 'PENDING', retryCount: 0 }
    ];

    const ctx: IOrderFulfillmentContext = {
      fulfillmentWorkflowId: workflowId,
      orderId,
      tenantId,
      customerId,
      destinationWarehouseId: warehouseId,
      steps,
      overallStatus: 'INITIALIZED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(workflowId, ctx);
    return ctx;
  }

  public async advanceStep(workflowId: string, stepId: string, isSuccess: boolean, outputData?: Record<string, any>, errorMsg?: string): Promise<IOrderFulfillmentContext> {
    const wf = this.workflows.get(workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    const step = wf.steps.find(s => s.stepId === stepId);
    if (!step) throw new Error(`Step ${stepId} not found in workflow`);

    step.completionTime = new Date();
    if (isSuccess) {
      step.status = 'COMPLETED';
      step.outputPayload = outputData;
    } else {
      step.status = 'FAILED';
      step.errorMessage = errorMsg;
      wf.overallStatus = 'CANCELLED';
      await this.triggerCompensation(wf, stepId);
      return wf;
    }

    // Check if all steps are completed
    const allCompleted = wf.steps.every(s => s.status === 'COMPLETED');
    if (allCompleted) {
      wf.overallStatus = 'FULFILLED';
    } else {
      wf.overallStatus = 'PROCESSING';
      const nextPending = wf.steps.find(s => s.status === 'PENDING');
      if (nextPending) {
        nextPending.status = 'IN_PROGRESS';
        nextPending.startTime = new Date();
      }
    }

    wf.updatedAt = new Date();
    return wf;
  }

  private async triggerCompensation(wf: IOrderFulfillmentContext, failedStepId: string): Promise<void> {
    const completedSteps = wf.steps.filter(s => s.status === 'COMPLETED');
    for (const step of completedSteps.reverse()) {
      step.status = 'COMPENSATED';
    }
  }

  public getWorkflowStatus(workflowId: string): IOrderFulfillmentContext | null {
    return this.workflows.get(workflowId) || null;
  }
}
