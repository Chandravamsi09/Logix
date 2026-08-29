import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventoryService';
import { ValidationUtils } from '@nexus/common';
import { CreateProductSchema, CreateWarehouseSchema, ReserveStockSchema, AdjustStockSchema } from '../dto/inventory.dto';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(CreateProductSchema, { ...req.body, tenantId });
      const product = await this.inventoryService.createProduct(validated);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  };

  createWarehouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(CreateWarehouseSchema, { ...req.body, tenantId });
      const warehouse = await this.inventoryService.createWarehouse(validated);
      res.status(201).json({ success: true, data: warehouse });
    } catch (err) {
      next(err);
    }
  };

  reserveStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(ReserveStockSchema, { ...req.body, tenantId });
      const result = await this.inventoryService.reserveItemsForOrder(validated);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId;
      const validated = ValidationUtils.validate(AdjustStockSchema, { ...req.body, tenantId, userId });
      const result = await this.inventoryService.adjustStock(validated);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getWarehouseStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stock = await this.inventoryService.getWarehouseStock(req.params.warehouseId);
      res.status(200).json({ success: true, data: stock });
    } catch (err) {
      next(err);
    }
  };

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
      const products = await this.inventoryService.getProducts(tenantId);
      res.status(200).json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  };
}
