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

// Rotas para usuários do app
proofOfLifeRoutes.post('/', createProofOfLifeController.handle);
proofOfLifeRoutes.get('/history', listProofOfLifeController.handleHistory);
proofOfLifeRoutes.get('/history/:id', getProofHistoryController.handle);

// Rotas para admin
proofOfLifeRoutes.get('/admin', ensureOrganizationAdmin, listProofOfLifeController.handleAdmin);
proofOfLifeRoutes.put('/:id/review', ensureOrganizationAdmin, reviewProofOfLifeController.handle);

export { proofOfLifeRoutes };