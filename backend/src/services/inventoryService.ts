import pool from '../config/database';
import { calculateFIFOCost } from '../utils/calculations';

export interface InventoryItem {
  item_code: string;
  item_name: string;
  unit_of_measure: string;
  current_quantity?: number;
  unit_cost?: number;
  minimum_stock?: number;
}

export interface InventoryMovement {
  inventory_id: number;
  movement_type: 'purchase' | 'usage' | 'adjustment';
  movement_date: string;
  quantity: number;
  unit_cost: number;
  notes?: string;
}

export const inventoryService = {
  async createInventoryItem(data: InventoryItem) {
    const result = await pool.query(
      `INSERT INTO inventory (item_code, item_name, unit_of_measure, minimum_stock)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.item_code, data.item_name, data.unit_of_measure, data.minimum_stock || 0]
    );

    return result.rows[0];
  },

  async getInventoryItems(filters?: { lowStock?: boolean }) {
    let query = `
      SELECT 
        i.*,
        CASE WHEN i.current_quantity <= i.minimum_stock THEN true ELSE false END as is_low_stock
      FROM inventory i
      WHERE i.is_active = true
    `;

    if (filters?.lowStock) {
      query += ' AND i.current_quantity <= i.minimum_stock';
    }

    query += ' ORDER BY i.item_name';

    const result = await pool.query(query);
    return result.rows;
  },

  async recordPurchase(data: InventoryMovement) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const totalCost = data.quantity * data.unit_cost;

      // Record inventory transaction
      await client.query(
        `INSERT INTO inventory_transactions 
         (inventory_id, movement_type, movement_date, quantity, unit_cost, total_cost, remaining_quantity, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [data.inventory_id, 'purchase', data.movement_date, data.quantity, data.unit_cost, totalCost, data.quantity, data.notes]
      );

      // Update inventory
      await client.query(
        `UPDATE inventory 
         SET current_quantity = current_quantity + $1,
             total_value = total_value + $2,
             unit_cost = (total_value + $2) / (current_quantity + $1),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [data.quantity, totalCost, data.inventory_id]
      );

      await client.query('COMMIT');

      return { success: true, message: 'Purchase recorded successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async recordUsage(data: InventoryMovement) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get FIFO purchases
      const purchasesResult = await client.query(
        `SELECT id, quantity, unit_cost, remaining_quantity
         FROM inventory_transactions
         WHERE inventory_id = $1 AND movement_type = 'purchase' AND remaining_quantity > 0
         ORDER BY movement_date ASC`,
        [data.inventory_id]
      );

      if (purchasesResult.rows.length === 0) {
        throw new Error('No available inventory for usage');
      }

      const { cost, updatedPurchases } = calculateFIFOCost(
        purchasesResult.rows,
        data.quantity
      );

      // Update purchase records
      for (const purchase of updatedPurchases) {
        await client.query(
          'UPDATE inventory_transactions SET remaining_quantity = $1 WHERE id = $2',
          [purchase.remaining_quantity, purchase.id]
        );
      }

      // Record usage transaction
      await client.query(
        `INSERT INTO inventory_transactions 
         (inventory_id, movement_type, movement_date, quantity, unit_cost, total_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [data.inventory_id, 'usage', data.movement_date, data.quantity, cost / data.quantity, cost, data.notes]
      );

      // Update inventory
      await client.query(
        `UPDATE inventory 
         SET current_quantity = current_quantity - $1,
             total_value = total_value - $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [data.quantity, cost, data.inventory_id]
      );

      await client.query('COMMIT');

      return { success: true, cost, message: 'Usage recorded successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getInventoryReport() {
    const query = `
      SELECT 
        i.*,
        COALESCE(SUM(CASE WHEN it.movement_type = 'purchase' THEN it.quantity ELSE 0 END), 0) as total_purchased,
        COALESCE(SUM(CASE WHEN it.movement_type = 'usage' THEN it.quantity ELSE 0 END), 0) as total_used
      FROM inventory i
      LEFT JOIN inventory_transactions it ON i.id = it.inventory_id
      WHERE i.is_active = true
      GROUP BY i.id
      ORDER BY i.item_name
    `;

    const result = await pool.query(query);
    return result.rows;
  }
};
