import { Router } from 'express';
import { GetDashboardStatsController } from '../controllers/dashboard/getDashboardStatsController';
import { GetSuperAdminStatsController } from '../controllers/dashboard/getSuperAdminStatsController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureOrganizationAdmin } from '../middlewares/ensureOrganizationAdmin';
import { ensureSuperAdmin } from '../middlewares/ensureSuperAdmin';

const dashboardRoutes = Router();
const getDashboardStatsController = new GetDashboardStatsController();
const getSuperAdminStatsController = new GetSuperAdminStatsController();

dashboardRoutes.use(ensureAuthenticated);

// Rotas para admin do órgão
dashboardRoutes.get('/stats', ensureOrganizationAdmin, getDashboardStatsController.handle);

// Rotas para super admin
dashboardRoutes.get('/super-admin/stats', ensureSuperAdmin, getSuperAdminStatsController.handle);

export { dashboardRoutes };