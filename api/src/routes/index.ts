import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { organizationRoutes } from './organization.routes';
import { proofOfLifeRoutes } from './proofOfLife.routes';
import { recadastrationRoutes } from './recadastration.routes';
import { uploadRoutes } from './upload.routes';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/organizations', organizationRoutes);
routes.use('/proof-of-life', proofOfLifeRoutes);
routes.use('/recadastration', recadastrationRoutes);
routes.use('/upload', uploadRoutes);

export { routes };