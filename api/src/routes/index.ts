import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { organizationRoutes } from './organization.routes';
import { eventRoutes } from './event.routes';
import { userRoutes } from './user.routes';
import { proofOfLifeRoutes } from './proofOfLife.routes';
import { recadastrationRoutes } from './recadastration.routes';
import { uploadRoutes } from './upload.routes';
import { dashboardRoutes } from './dashboard.routes';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/organizations', organizationRoutes);
routes.use('/users', userRoutes);
routes.use('/proof-of-life', proofOfLifeRoutes);
routes.use('/recadastration', recadastrationRoutes);
routes.use('/uploads', uploadRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/events', eventRoutes);

export { routes };