import { Router } from 'express';
import { SuperAdminAuthController } from '../controllers/auth/superAdminAuthController';
import { OrganizationAuthController } from '../controllers/auth/organizationAuthController';
import { AppAuthController } from '../controllers/auth/appAuthController';

const authRoutes = Router();

const superAdminAuthController = new SuperAdminAuthController();
const organizationAuthController = new OrganizationAuthController();
const appAuthController = new AppAuthController();

// Super Admin routes
authRoutes.post('/superadmin/login', superAdminAuthController.handle);

// Organization routes
authRoutes.post('/organization/login', organizationAuthController.handle);

// App routes (mobile)
authRoutes.post('/app/login', appAuthController.handle);

export { authRoutes };