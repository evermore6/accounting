import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { inventoryService } from '../services/inventoryService';
import { auditLogMiddleware } from '../middleware/auditLog';

export const inventoryController = {
  async getInventory(req: AuthRequest, res: Response) {
    try {
      const lowStock = req.query.low_stock === 'true';

      const items = await inventoryService.getInventoryItems({ lowStock });

      res.json({ items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createInventoryItem(req: AuthRequest, res: Response) {
    try {
      const item = await inventoryService.createInventoryItem(req.body);

      await auditLogMiddleware(req, 'create', 'inventory', item.id, null, item);

      res.status(201).json({
        message: 'Inventory item created successfully',
        item
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async recordPurchase(req: AuthRequest, res: Response) {
    try {
      const result = await inventoryService.recordPurchase(req.body);

      await auditLogMiddleware(req, 'create', 'inventory_transaction', req.body.inventory_id);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async recordUsage(req: AuthRequest, res: Response) {
    try {
      const result = await inventoryService.recordUsage(req.body);

      await auditLogMiddleware(req, 'create', 'inventory_transaction', req.body.inventory_id);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getInventoryReport(req: AuthRequest, res: Response) {
    try {
      const report = await inventoryService.getInventoryReport();

      res.json({ report });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
