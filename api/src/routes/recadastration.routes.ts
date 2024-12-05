import { Router } from 'express';
import { CreateRecadastrationController } from '../controllers/recadastration/createRecadastrationController';
import { ListRecadastrationController } from '../controllers/recadastration/listRecadastrationController';
import { ReviewRecadastrationController } from '../controllers/recadastration/reviewRecadastrationController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureOrganizationAdmin } from '../middlewares/ensureOrganizationAdmin';

const recadastrationRoutes = Router();

const createRecadastrationController = new CreateRecadastrationController();
const listRecadastrationController = new ListRecadastrationController();
const reviewRecadastrationController = new ReviewRecadastrationController();

recadastrationRoutes.use(ensureAuthenticated);

// Routes for both admin and regular users
recadastrationRoutes.post('/', createRecadastrationController.handle);
recadastrationRoutes.get('/', listRecadastrationController.handle);

// Admin only routes
recadastrationRoutes.put('/:id/review', ensureOrganizationAdmin, reviewRecadastrationController.handle);

export { recadastrationRoutes };