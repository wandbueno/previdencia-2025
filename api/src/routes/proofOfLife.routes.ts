import { Router } from 'express';
import { CreateProofOfLifeController } from '../controllers/proofOfLife/createProofOfLifeController';
import { ListProofOfLifeController } from '../controllers/proofOfLife/listProofOfLifeController';
import { ReviewProofOfLifeController } from '../controllers/proofOfLife/reviewProofOfLifeController';
import { GetProofHistoryController } from '../controllers/proofOfLife/getProofHistoryController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureOrganizationAdmin } from '../middlewares/ensureOrganizationAdmin';

const proofOfLifeRoutes = Router();

const createProofOfLifeController = new CreateProofOfLifeController();
const listProofOfLifeController = new ListProofOfLifeController();
const reviewProofOfLifeController = new ReviewProofOfLifeController();
const getProofHistoryController = new GetProofHistoryController();

proofOfLifeRoutes.use(ensureAuthenticated);

// Routes for both admin and regular users
proofOfLifeRoutes.post('/', createProofOfLifeController.handle);
proofOfLifeRoutes.get('/', listProofOfLifeController.handle);
proofOfLifeRoutes.get('/:id/history', getProofHistoryController.handle);

// Admin only routes
proofOfLifeRoutes.put('/:id/review', ensureOrganizationAdmin, reviewProofOfLifeController.handle);

export { proofOfLifeRoutes };