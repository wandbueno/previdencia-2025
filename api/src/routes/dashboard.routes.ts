import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard/dashboardController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.use(ensureAuthenticated);

dashboardRoutes.get('/stats', dashboardController.getStats);

export { dashboardRoutes };