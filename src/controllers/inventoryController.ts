// Inventory controller

import { Request, Response } from 'express';
import InventoryService from '../services/inventoryService';
import { asyncHandler } from '../middleware/errorHandler';
import { SUCCESS_MESSAGES } from '../config/constants';

export class InventoryController {
  static createItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemCode, itemName, description, unit } = req.body;

    const item = await InventoryService.createItem({
      itemCode,
      itemName,
      description,
      unit,
    });

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATE_SUCCESS,
      data: item,
      timestamp: new Date(),
    });
  });

  static getItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const item = await InventoryService.getItem(id);

    res.json({
      success: true,
      message: 'Inventory item retrieved successfully',
      data: item,
      timestamp: new Date(),
    });
  });

  static listItems = asyncHandler(async (req: Request, res: Response) => {
    const { status, page, limit } = req.query;

    const filters: any = {};
    
    if (status) filters.status = status as string;
    if (page) filters.page = parseInt(page as string, 10);
    if (limit) filters.limit = parseInt(limit as string, 10);

    const result = await InventoryService.listItems(filters);

    res.json({
      success: true,
      message: 'Inventory items retrieved successfully',
      data: result.items,
      pagination: {
        page: result.page,
        limit: filters.limit || 20,
        total: result.total,
        totalPages: result.totalPages,
      },
      timestamp: new Date(),
    });
  });

  static receiveInventory = asyncHandler(async (req: Request, res: Response) => {
    const { inventoryId, quantity, unitCost, referenceType, referenceId, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const transaction = await InventoryService.receiveInventory({
      inventoryId,
      quantity: parseFloat(quantity),
      unitCost: parseFloat(unitCost),
      referenceType,
      referenceId,
      notes,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Inventory received successfully',
      data: transaction,
      timestamp: new Date(),
    });
  });

  static issueInventory = asyncHandler(async (req: Request, res: Response) => {
    const { inventoryId, quantity, unitCost, referenceType, referenceId, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const transaction = await InventoryService.issueInventory({
      inventoryId,
      quantity: parseFloat(quantity),
      unitCost: unitCost ? parseFloat(unitCost) : undefined,
      referenceType,
      referenceId,
      notes,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Inventory issued successfully',
      data: transaction,
      timestamp: new Date(),
    });
  });

  static getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate, transactionType } = req.query;

    const filters: any = {};
    
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (transactionType) filters.transactionType = transactionType as 'IN' | 'OUT';

    const transactions = await InventoryService.getTransactions(id, filters);

    res.json({
      success: true,
      message: 'Inventory transactions retrieved successfully',
      data: transactions,
      timestamp: new Date(),
    });
  });

  static getStockValue = asyncHandler(async (req: Request, res: Response) => {
    const totalValue = await InventoryService.getStockValue();

    res.json({
      success: true,
      message: 'Total stock value retrieved successfully',
      data: { totalValue },
      timestamp: new Date(),
    });
  });

  static getLowStockItems = asyncHandler(async (req: Request, res: Response) => {
    const { threshold } = req.query;
    
    const thresholdValue = threshold ? parseInt(threshold as string, 10) : 10;
    const items = await InventoryService.getLowStockItems(thresholdValue);

    res.json({
      success: true,
      message: 'Low stock items retrieved successfully',
      data: items,
      timestamp: new Date(),
    });
  });
}

export default InventoryController;
