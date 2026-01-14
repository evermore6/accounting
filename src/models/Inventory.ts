// Inventory model

import { executeQuery, getClient } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  description?: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export class InventoryModel {
  static async findById(id: string): Promise<InventoryItem | null> {
    const query = `
      SELECT id, item_code as "itemCode", item_name as "itemName", 
             description, unit, quantity, unit_cost as "unitCost", 
             total_value as "totalValue", status,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM inventory
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    const result = await executeQuery(query, [id]);
    return result.rows[0] || null;
  }

  static async findByCode(itemCode: string): Promise<InventoryItem | null> {
    const query = `
      SELECT id, item_code as "itemCode", item_name as "itemName", 
             description, unit, quantity, unit_cost as "unitCost", 
             total_value as "totalValue", status,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM inventory
      WHERE item_code = $1 AND deleted_at IS NULL
    `;
    
    const result = await executeQuery(query, [itemCode]);
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: InventoryItem[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT id, item_code as "itemCode", item_name as "itemName", 
             description, unit, quantity, unit_cost as "unitCost", 
             total_value as "totalValue", status,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM inventory
      WHERE ${whereClause}
      ORDER BY item_code ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory
      WHERE ${whereClause}
    `;

    params.push(limit, offset);

    const [itemsResult, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params.slice(0, -2)),
    ]);

    return {
      items: itemsResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  static async create(itemData: {
    itemCode: string;
    itemName: string;
    description?: string;
    unit: string;
  }): Promise<InventoryItem> {
    const id = uuidv4();

    const query = `
      INSERT INTO inventory (
        id, item_code, item_name, description, unit, quantity, unit_cost, total_value, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, item_code as "itemCode", item_name as "itemName", 
                description, unit, quantity, unit_cost as "unitCost", 
                total_value as "totalValue", status,
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await executeQuery(query, [
      id,
      itemData.itemCode,
      itemData.itemName,
      itemData.description || null,
      itemData.unit,
      0,
      0,
      0,
      'active',
    ]);

    return result.rows[0];
  }

  static async recordTransaction(txnData: {
    inventoryId: string;
    transactionType: 'IN' | 'OUT';
    quantity: number;
    unitCost: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    createdBy: string;
  }): Promise<InventoryTransaction> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      const txnId = uuidv4();
      const totalCost = txnData.quantity * txnData.unitCost;

      // Insert transaction
      const txnQuery = `
        INSERT INTO inventory_transactions (
          id, inventory_id, transaction_type, quantity, unit_cost, total_cost,
          reference_type, reference_id, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, inventory_id as "inventoryId", transaction_type as "transactionType",
                  quantity, unit_cost as "unitCost", total_cost as "totalCost",
                  reference_type as "referenceType", reference_id as "referenceId",
                  notes, created_by as "createdBy", created_at as "createdAt"
      `;

      const txnResult = await client.query(txnQuery, [
        txnId,
        txnData.inventoryId,
        txnData.transactionType,
        txnData.quantity,
        txnData.unitCost,
        totalCost,
        txnData.referenceType || null,
        txnData.referenceId || null,
        txnData.notes || null,
        txnData.createdBy,
      ]);

      // Update inventory
      const item = await this.findById(txnData.inventoryId);
      if (!item) {
        throw new Error('Inventory item not found');
      }

      let newQuantity = item.quantity;
      let newTotalValue = item.totalValue;
      let newUnitCost = item.unitCost;

      if (txnData.transactionType === 'IN') {
        // Add to inventory using weighted average
        newQuantity = item.quantity + txnData.quantity;
        newTotalValue = item.totalValue + totalCost;
        newUnitCost = newQuantity > 0 ? newTotalValue / newQuantity : 0;
      } else {
        // Remove from inventory (FIFO or weighted average)
        newQuantity = item.quantity - txnData.quantity;
        if (newQuantity < 0) {
          throw new Error('Insufficient inventory');
        }
        newTotalValue = item.totalValue - totalCost;
        newUnitCost = newQuantity > 0 ? newTotalValue / newQuantity : 0;
      }

      const updateQuery = `
        UPDATE inventory
        SET quantity = $1, unit_cost = $2, total_value = $3, updated_at = NOW()
        WHERE id = $4
      `;

      await client.query(updateQuery, [newQuantity, newUnitCost, newTotalValue, txnData.inventoryId]);

      await client.query('COMMIT');
      
      return txnResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTransactions(
    inventoryId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      transactionType?: 'IN' | 'OUT';
    }
  ): Promise<InventoryTransaction[]> {
    let whereConditions = ['inventory_id = $1'];
    const params: any[] = [inventoryId];
    let paramIndex = 2;

    if (filters?.startDate) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters?.transactionType) {
      whereConditions.push(`transaction_type = $${paramIndex}`);
      params.push(filters.transactionType);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT id, inventory_id as "inventoryId", transaction_type as "transactionType",
             quantity, unit_cost as "unitCost", total_cost as "totalCost",
             reference_type as "referenceType", reference_id as "referenceId",
             notes, created_by as "createdBy", created_at as "createdAt"
      FROM inventory_transactions
      WHERE ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await executeQuery(query, params);
    return result.rows;
  }
}

export default InventoryModel;
