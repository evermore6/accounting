// Inventory routes

import { Router } from 'express';
import InventoryController from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create inventory item (admin/accountant only)
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  InventoryController.createItem
);

// Get inventory items
router.get('/', InventoryController.listItems);
router.get('/stock-value', InventoryController.getStockValue);
router.get('/low-stock', InventoryController.getLowStockItems);
router.get('/:id', InventoryController.getItem);
router.get('/:id/transactions', InventoryController.getTransactions);

// Receive inventory
router.post('/receive', InventoryController.receiveInventory);

// Issue inventory
router.post('/issue', InventoryController.issueInventory);

export default router;
