// Inventory Service - Inventory management operations

import InventoryModel from '../models/Inventory';
import { AppError } from '../middleware/errorHandler';
import { ERROR_MESSAGES } from '../config/constants';

export class InventoryService {
  static async createItem(itemData: {
    itemCode: string;
    itemName: string;
    description?: string;
    unit: string;
  }): Promise<any> {
    // Check if item code already exists
    const existing = await InventoryModel.findByCode(itemData.itemCode);
    
    if (existing) {
      throw new AppError(ERROR_MESSAGES.DUPLICATE_ENTRY, 400);
    }

    return await InventoryModel.create(itemData);
  }

  static async getItem(id: string): Promise<any> {
    const item = await InventoryModel.findById(id);
    
    if (!item) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    return item;
  }

  static async getItemByCode(itemCode: string): Promise<any> {
    const item = await InventoryModel.findByCode(itemCode);
    
    if (!item) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    return item;
  }

  static async listItems(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; total: number; page: number; totalPages: number }> {
    const result = await InventoryModel.findAll(filters);
    const limit = filters?.limit || 20;
    const page = filters?.page || 1;
    const totalPages = Math.ceil(result.total / limit);

    return {
      items: result.items,
      total: result.total,
      page,
      totalPages,
    };
  }

  static async receiveInventory(data: {
    inventoryId: string;
    quantity: number;
    unitCost: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    createdBy: string;
  }): Promise<any> {
    // Validate item exists
    const item = await InventoryModel.findById(data.inventoryId);
    
    if (!item) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    if (data.quantity <= 0) {
      throw new AppError('Quantity must be positive', 400);
    }

    if (data.unitCost < 0) {
      throw new AppError('Unit cost cannot be negative', 400);
    }

    return await InventoryModel.recordTransaction({
      inventoryId: data.inventoryId,
      transactionType: 'IN',
      quantity: data.quantity,
      unitCost: data.unitCost,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      notes: data.notes,
      createdBy: data.createdBy,
    });
  }

  static async issueInventory(data: {
    inventoryId: string;
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    createdBy: string;
  }): Promise<any> {
    // Validate item exists
    const item = await InventoryModel.findById(data.inventoryId);
    
    if (!item) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    if (data.quantity <= 0) {
      throw new AppError('Quantity must be positive', 400);
    }

    if (item.quantity < data.quantity) {
      throw new AppError('Insufficient inventory', 400);
    }

    // Use current unit cost if not provided
    const unitCost = data.unitCost || item.unitCost;

    return await InventoryModel.recordTransaction({
      inventoryId: data.inventoryId,
      transactionType: 'OUT',
      quantity: data.quantity,
      unitCost,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      notes: data.notes,
      createdBy: data.createdBy,
    });
  }

  static async getTransactions(
    inventoryId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      transactionType?: 'IN' | 'OUT';
    }
  ): Promise<any[]> {
    // Validate item exists
    const item = await InventoryModel.findById(inventoryId);
    
    if (!item) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    return await InventoryModel.getTransactions(inventoryId, filters);
  }

  static async getStockValue(): Promise<number> {
    const result = await InventoryModel.findAll();
    return result.items.reduce((sum, item) => sum + item.totalValue, 0);
  }

  static async getLowStockItems(threshold: number = 10): Promise<any[]> {
    const result = await InventoryModel.findAll();
    return result.items.filter(item => item.quantity < threshold && item.status === 'active');
  }
}

export default InventoryService;
