import { ProductRepository, WarehouseRepository, StockLevelRepository } from '../repositories/inMemoryInventoryRepositories';
import { CreateProductDTO, CreateWarehouseDTO, ReserveStockDTO, AdjustStockDTO } from '../dto/inventory.dto';
import { NotFoundException, InsufficientInventoryException, ConflictException, StockMovementType } from '@nexus/common';

export class InventoryService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly warehouseRepo: WarehouseRepository,
    private readonly stockRepo: StockLevelRepository
  ) {}

  async createProduct(dto: CreateProductDTO) {
    const existing = await this.productRepo.findBySku(dto.sku, dto.tenantId);
    if (existing) {
      throw new ConflictException(`Product with SKU '${dto.sku}' already exists in this tenant.`);
    }
    return this.productRepo.create({ ...dto, isActive: true });
  }

  async createWarehouse(dto: CreateWarehouseDTO) {
    const wh = await this.warehouseRepo.createWarehouse({ ...dto, isActive: true });
    // Seed default receiving and pick bins
    await this.warehouseRepo.createBin({
      warehouseId: wh.id,
      tenantId: dto.tenantId,
      zone: 'RECEIVING_DOCK' as any,
      aisle: 'A',
      rack: '01',
      shelf: '1',
      binCode: 'RCV-01-A',
      maxVolumeCm3: 5000000,
      maxWeightKg: 10000,
      isOccupied: false
    });
    return wh;
  }

  async reserveItemsForOrder(dto: ReserveStockDTO) {
    const reservations = [];
    for (const item of dto.items) {
      const stock = await this.stockRepo.getStock(dto.warehouseId, item.sku);
      if (!stock || stock.quantityAvailable < item.quantity) {
        throw new InsufficientInventoryException(item.sku, item.quantity, stock ? stock.quantityAvailable : 0);
      }
    }

    // Atomically reserve all items
    for (const item of dto.items) {
      const res = await this.stockRepo.reserveStock(dto.orderId, dto.warehouseId, item.sku, item.quantity, dto.tenantId);
      reservations.push(res);
    }

    return { orderId: dto.orderId, warehouseId: dto.warehouseId, reservations };
  }

  async adjustStock(dto: AdjustStockDTO) {
    const stock = await this.stockRepo.upsertStock({
      tenantId: dto.tenantId,
      warehouseId: dto.warehouseId,
      binLocationId: dto.binLocationId,
      sku: dto.sku,
      quantityOnHand: dto.quantityDelta,
      quantityReserved: 0
    });

    await this.stockRepo.recordMovement({
      tenantId: dto.tenantId,
      warehouseId: dto.warehouseId,
      sku: dto.sku,
      movementType: dto.movementType,
      quantityDelta: dto.quantityDelta,
      referenceId: dto.referenceId,
      performedByUserId: dto.userId,
      notes: dto.notes
    });

    return stock;
  }

  async getWarehouseStock(warehouseId: string) {
    return this.stockRepo.listStockByWarehouse(warehouseId);
  }

  async getProducts(tenantId: string) {
    return this.productRepo.listByTenant(tenantId);
  }
}
