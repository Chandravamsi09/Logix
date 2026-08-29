import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { ValidationUtils } from '@nexus/common';
import { CreateOrderSchema, CancelOrderSchema } from '../dto/order.dto';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(CreateOrderSchema, { ...req.body, tenantId });
      const order = await this.orderService.createOrder(validated);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  getOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.getOrder(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  listOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
      const orders = await this.orderService.listOrders(tenantId);
      res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = ValidationUtils.validate(CancelOrderSchema, req.body);
      const order = await this.orderService.cancelOrder(req.params.id, validated);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };
}
