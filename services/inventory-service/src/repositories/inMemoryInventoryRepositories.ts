import { ProductEntity, WarehouseEntity, BinLocationEntity, StockLevelEntity, StockReservationEntity, StockAuditMovementEntity } from '../models/entities';
import { v4 as uuidv4 } from 'uuid';

export class ProductRepository {
  private products = new Map<string, ProductEntity>();

  async create(product: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity> {
    const entity: ProductEntity = {
      ...product,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.products.get(id) || null;
  }

  async findBySku(sku: string, tenantId: string): Promise<ProductEntity | null> {
    for (const p of this.products.values()) {
      if (p.sku === sku && p.tenantId === tenantId) return p;
    }
    return null;
  }

  async listByTenant(tenantId: string): Promise<ProductEntity[]> {
    return Array.from(this.products.values()).filter(p => p.tenantId === tenantId);
  }
}

export class WarehouseRepository {
  private warehouses = new Map<string, WarehouseEntity>();
  private bins = new Map<string, BinLocationEntity>();

  async createWarehouse(wh: Omit<WarehouseEntity, 'id' | 'createdAt'>): Promise<WarehouseEntity> {
    const entity: WarehouseEntity = {
      ...wh,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.warehouses.set(entity.id, entity);
    return entity;
  }

  async findWarehouseById(id: string): Promise<WarehouseEntity | null> {
    return this.warehouses.get(id) || null;
  }

  async listWarehousesByTenant(tenantId: string): Promise<WarehouseEntity[]> {
    return Array.from(this.warehouses.values()).filter(w => w.tenantId === tenantId);
  }

  async createBin(bin: Omit<BinLocationEntity, 'id'>): Promise<BinLocationEntity> {
    const entity: BinLocationEntity = {
      ...bin,
      id: uuidv4()
    };
    this.bins.set(entity.id, entity);
    return entity;
  }

  async listBinsByWarehouse(warehouseId: string): Promise<BinLocationEntity[]> {
    return Array.from(this.bins.values()).filter(b => b.warehouseId === warehouseId);
  }
}

export class StockLevelRepository {
  private stock = new Map<string, StockLevelEntity>();
  private reservations = new Map<string, StockReservationEntity>();
  private movements: StockAuditMovementEntity[] = [];

  async getStock(warehouseId: string, sku: string): Promise<StockLevelEntity | null> {
    for (const item of this.stock.values()) {
      if (item.warehouseId === warehouseId && item.sku === sku) {
        return item;
      }
    }
    return null;
  }

  async upsertStock(item: Omit<StockLevelEntity, 'id' | 'quantityAvailable' | 'updatedAt'>): Promise<StockLevelEntity> {
    const existing = await this.getStock(item.warehouseId, item.sku);
    if (existing) {
      existing.quantityOnHand += item.quantityOnHand;
      existing.quantityAvailable = existing.quantityOnHand - existing.quantityReserved;
      existing.updatedAt = new Date();
      this.stock.set(existing.id, existing);
      return existing;
    }

    const entity: StockLevelEntity = {
      ...item,
      id: uuidv4(),
      quantityAvailable: item.quantityOnHand - item.quantityReserved,
      updatedAt: new Date()
    };
    this.stock.set(entity.id, entity);
    return entity;
  }

  async reserveStock(orderId: string, warehouseId: string, sku: string, qty: number, tenantId: string): Promise<StockReservationEntity> {
    const stock = await this.getStock(warehouseId, sku);
    if (!stock || stock.quantityAvailable < qty) {
      throw new Error(`Insufficient stock for SKU ${sku}`);
    }

    stock.quantityReserved += qty;
    stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    stock.updatedAt = new Date();

    const reservation: StockReservationEntity = {
      id: uuidv4(),
      tenantId,
      orderId,
      warehouseId,
      sku,
      reservedQty: qty,
      binLocationId: stock.binLocationId,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      createdAt: new Date()
    };

    this.reservations.set(reservation.id, reservation);
    return reservation;
  }

  async releaseReservation(reservationId: string): Promise<void> {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'ACTIVE') return;

    const stock = await this.getStock(res.warehouseId, res.sku);
    if (stock) {
      stock.quantityReserved = Math.max(0, stock.quantityReserved - res.reservedQty);
      stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
      stock.updatedAt = new Date();
    }
    res.status = 'RELEASED';
  }

  async recordMovement(movement: Omit<StockAuditMovementEntity, 'id' | 'createdAt'>): Promise<StockAuditMovementEntity> {
    const entity: StockAuditMovementEntity = {
      ...movement,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.movements.push(entity);
    return entity;
  }

  async listStockByWarehouse(warehouseId: string): Promise<StockLevelEntity[]> {
    return Array.from(this.stock.values()).filter(s => s.warehouseId === warehouseId);
  }
}
