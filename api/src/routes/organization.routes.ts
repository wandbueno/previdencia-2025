import { Router } from 'express';
import { CreateOrganizationController } from '../controllers/organization/createOrganizationController';
import { ListOrganizationsController } from '../controllers/organization/listOrganizationsController';
import { UpdateOrganizationController } from '../controllers/organization/updateOrganizationController';
import { DeleteOrganizationController } from '../controllers/organization/deleteOrganizationController';
import { GetOrganizationController } from '../controllers/organization/getOrganizationController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureSuperAdmin } from '../middlewares/ensureSuperAdmin';

const organizationRoutes = Router();

const createOrganizationController = new CreateOrganizationController();
const listOrganizationsController = new ListOrganizationsController();
const updateOrganizationController = new UpdateOrganizationController();
const deleteOrganizationController = new DeleteOrganizationController();
const getOrganizationController = new GetOrganizationController();

// Public routes
organizationRoutes.get('/public', async (req, res) => {
  try {
    return listOrganizationsController.handlePublic(req, res);
  } catch (error) {
    console.error('Error in public organizations route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes
organizationRoutes.use(ensureAuthenticated);
organizationRoutes.use(ensureSuperAdmin);

organizationRoutes.post('/', createOrganizationController.handle);
organizationRoutes.get('/', listOrganizationsController.handle);
organizationRoutes.get('/:id', getOrganizationController.handle);
organizationRoutes.put('/:id', updateOrganizationController.handle);
organizationRoutes.delete('/:id', deleteOrganizationController.handle);

export { organizationRoutes };