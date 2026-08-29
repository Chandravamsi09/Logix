import { SagaRepository, OrderRepository } from '../repositories/inMemoryOrderRepositories';
import { SagaStatus, OrderStatus, Logger } from '@nexus/common';

export class OrderSagaOrchestrator {
  private readonly logger = new Logger('OrderSagaOrchestrator');

  constructor(
    private readonly sagaRepo: SagaRepository,
    private readonly orderRepo: OrderRepository
  ) {}

  async startOrderSaga(orderId: string, tenantId: string): Promise<void> {
    const saga = await this.sagaRepo.create({
      orderId,
      tenantId,
      status: SagaStatus.STARTED,
      currentStep: 'RESERVE_INVENTORY',
      steps: [
        { stepName: 'VALIDATE_ORDER', status: 'SUCCESS', executedAt: new Date() },
        { stepName: 'RESERVE_INVENTORY', status: 'PENDING' },
        { stepName: 'AUTHORIZE_PAYMENT', status: 'PENDING' },
        { stepName: 'SCHEDULE_DISPATCH', status: 'PENDING' }
      ]
    });

    await this.orderRepo.update(orderId, {
      sagaInstanceId: saga.id,
      status: OrderStatus.INVENTORY_RESERVING
    });

    this.logger.info(`Saga ${saga.id} started for Order ${orderId}`);
    // Step 1: Inventory reservation simulation
    await this.executeStepInventory(saga.id, orderId);
  }

  private async executeStepInventory(sagaId: string, orderId: string): Promise<void> {
    const saga = await this.sagaRepo.findById(sagaId);
    if (!saga) return;

    // Simulate inventory step execution
    const step = saga.steps.find(s => s.stepName === 'RESERVE_INVENTORY');
    if (step) {
      step.status = 'SUCCESS';
      step.executedAt = new Date();
    }

    await this.sagaRepo.update(sagaId, {
      status: SagaStatus.IN_PROGRESS,
      currentStep: 'AUTHORIZE_PAYMENT'
    });

    await this.orderRepo.update(orderId, {
      status: OrderStatus.PAYMENT_PROCESSING
    });

    // Step 2: Payment authorization simulation
    await this.executeStepPayment(sagaId, orderId);
  }

  private async executeStepPayment(sagaId: string, orderId: string): Promise<void> {
    const saga = await this.sagaRepo.findById(sagaId);
    if (!saga) return;

    const step = saga.steps.find(s => s.stepName === 'AUTHORIZE_PAYMENT');
    if (step) {
      step.status = 'SUCCESS';
      step.executedAt = new Date();
    }

    const dispatchStep = saga.steps.find(s => s.stepName === 'SCHEDULE_DISPATCH');
    if (dispatchStep) {
      dispatchStep.status = 'SUCCESS';
      dispatchStep.executedAt = new Date();
    }

    await this.sagaRepo.update(sagaId, {
      status: SagaStatus.COMPLETED,
      currentStep: 'COMPLETED'
    });

    await this.orderRepo.update(orderId, {
      status: OrderStatus.DISPATCH_SCHEDULED
    });

    this.logger.info(`Order Saga ${sagaId} completed successfully for Order ${orderId}`);
  }
}
