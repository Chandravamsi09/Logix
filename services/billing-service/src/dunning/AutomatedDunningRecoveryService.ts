/**
 * Automated Dunning & Accounts Receivable Recovery Pipeline
 * Orchestrates retries, delinquency notifications, and grace-period lifecycle.
 */

export interface IDunningWorkflowState {
  invoiceId: string;
  customerId: string;
  daysOverdue: number;
  retryAttemptCount: number;
  nextRetryDate?: Date;
  status: 'CURRENT' | 'SOFT_DUNNING' | 'HARD_DUNNING' | 'DEFAULTED' | 'RECOVERED';
}

export class AutomatedDunningRecoveryService {
  private readonly workflows = new Map<string, IDunningWorkflowState>();

  public processOverdueInvoice(invoiceId: string, customerId: string, daysOverdue: number): IDunningWorkflowState {
    let state = this.workflows.get(invoiceId);
    if (!state) {
      state = {
        invoiceId,
        customerId,
        daysOverdue,
        retryAttemptCount: 0,
        status: 'CURRENT'
      };
      this.workflows.set(invoiceId, state);
    }

    state.daysOverdue = daysOverdue;

    if (daysOverdue > 60) {
      state.status = 'DEFAULTED';
    } else if (daysOverdue > 30) {
      state.status = 'HARD_DUNNING';
      state.retryAttemptCount++;
      state.nextRetryDate = new Date(Date.now() + 3 * 86400000); // Retry in 3 days
    } else if (daysOverdue > 7) {
      state.status = 'SOFT_DUNNING';
      state.retryAttemptCount++;
      state.nextRetryDate = new Date(Date.now() + 5 * 86400000);
    }

    return state;
  }
}
