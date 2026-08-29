import { ProductRepository, WarehouseRepository, StockLevelRepository } from '../../services/inventory-service/src/repositories/inMemoryInventoryRepositories';
import { InventoryService } from '../../services/inventory-service/src/services/inventoryService';
import { StockMovementType } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

describe('Warehouse & Inventory Service Test Suite', () => {
  let inventoryService: InventoryService;
  let stockRepo: StockLevelRepository;
  let warehouseRepo: WarehouseRepository;
  let productRepo: ProductRepository;
  const tenantId = uuidv4();
  let warehouseId: string;

  beforeEach(async () => {
    productRepo = new ProductRepository();
    warehouseRepo = new WarehouseRepository();
    stockRepo = new StockLevelRepository();
    inventoryService = new InventoryService(productRepo, warehouseRepo, stockRepo);

    const wh = await inventoryService.createWarehouse({
      tenantId,
      code: 'WH-OAKLAND-01',
      name: 'Oakland Main Distribution Center',
      address: {
        streetLine1: '100 Port Street',
        city: 'Oakland',
        stateOrProvince: 'CA',
        postalCode: '94607',
        countryCode: 'US'
      },
      totalAreaSqFt: 150000,
      maxPalletCapacity: 12000
    });
    warehouseId = wh.id;
  });

  test('TC-04: Should record inbound stock adjustment and track available quantity', async () => {
    const sku = 'SKU-DRONE-4K';
    const binId = uuidv4();

    await inventoryService.adjustStock({
      tenantId,
      warehouseId,
      binLocationId: binId,
      sku,
      movementType: StockMovementType.INBOUND_RECEIPT,
      quantityDelta: 50,
      userId: uuidv4(),
      notes: 'Initial PO receipt'
    });

    const stock = await stockRepo.getStock(warehouseId, sku);
    expect(stock).toBeDefined();
    expect(stock!.quantityOnHand).toBe(50);
    expect(stock!.quantityAvailable).toBe(50);
    expect(stock!.quantityReserved).toBe(0);
  });

  test('TC-05: Should atomically reserve stock for valid orders and reject reservations exceeding stock', async () => {
    const sku = 'SKU-PALLET-WRAP';
    const binId = uuidv4();

    await inventoryService.adjustStock({
      tenantId,
      warehouseId,
      binLocationId: binId,
      sku,
      movementType: StockMovementType.INBOUND_RECEIPT,
      quantityDelta: 20,
      userId: uuidv4()
    });

    const orderId = uuidv4();
    const result = await inventoryService.reserveItemsForOrder({
      tenantId,
      orderId,
      warehouseId,
      items: [{ sku, quantity: 15 }]
    });

    expect(result.reservations).toHaveLength(1);
    expect(result.reservations[0].reservedQty).toBe(15);

    const stockAfter = await stockRepo.getStock(warehouseId, sku);
    expect(stockAfter!.quantityAvailable).toBe(5);
    expect(stockAfter!.quantityReserved).toBe(15);

    // Rejection on insufficient stock
    await expect(inventoryService.reserveItemsForOrder({
      tenantId,
      orderId: uuidv4(),
      warehouseId,
      items: [{ sku, quantity: 10 }] // only 5 available
    })).rejects.toThrow();
  });
});
