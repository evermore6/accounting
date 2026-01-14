import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', inventoryController.getInventory);
router.get('/report', inventoryController.getInventoryReport);
router.post('/', authorize('owner', 'admin_accounting'), inventoryController.createInventoryItem);
router.post('/purchase', authorize('owner', 'admin_accounting', 'staff'), inventoryController.recordPurchase);
router.post('/usage', authorize('owner', 'admin_accounting'), inventoryController.recordUsage);

export default router;
