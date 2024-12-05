import { Router } from 'express';
import { SuperAdminAuthController } from '../controllers/auth/superAdminAuthController';
import { OrganizationAuthController } from '../controllers/auth/organizationAuthController';

const authRoutes = Router();

const superAdminAuthController = new SuperAdminAuthController();
const organizationAuthController = new OrganizationAuthController();

// Super Admin routes
authRoutes.post('/superadmin/login', superAdminAuthController.handle);

// Organization routes
authRoutes.post('/organization/login', organizationAuthController.handle);

export { authRoutes };