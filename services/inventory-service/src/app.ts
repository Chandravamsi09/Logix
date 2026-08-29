import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ProductRepository, WarehouseRepository, StockLevelRepository } from './repositories/inMemoryInventoryRepositories';
import { InventoryService } from './services/inventoryService';
import { InventoryController } from './controllers/inventoryController';
import { BaseDomainException, Logger, ServiceHealth } from '@nexus/common';

const logger = new Logger('InventoryService');

export const createInventoryApp = (): express.Application => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const productRepo = new ProductRepository();
  const warehouseRepo = new WarehouseRepository();
  const stockRepo = new StockLevelRepository();
  const inventoryService = new InventoryService(productRepo, warehouseRepo, stockRepo);
  const inventoryController = new InventoryController(inventoryService);

  // Health
  app.get('/health', (_req: Request, res: Response) => {
    const health: ServiceHealth = {
      service: 'inventory-service',
      status: 'healthy',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected',
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    };
    res.status(200).json(health);
  });

  // Endpoints
  app.post('/api/v1/inventory/products', inventoryController.createProduct);
  app.get('/api/v1/inventory/products', inventoryController.getProducts);
  app.post('/api/v1/inventory/warehouses', inventoryController.createWarehouse);
  app.post('/api/v1/inventory/reserve', inventoryController.reserveStock);
  app.post('/api/v1/inventory/adjust', inventoryController.adjustStock);
  app.get('/api/v1/inventory/warehouses/:warehouseId/stock', inventoryController.getWarehouseStock);

  // Error Handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof BaseDomainException) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      });
    }
    logger.error('Unhandled Exception in Inventory Service', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_INVENTORY_ERROR', message: 'Internal server error.' }
    });
  });

  return app;
};
