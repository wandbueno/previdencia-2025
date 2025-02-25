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

// Rota raiz com informações detalhadas
routes.get('/', (req, res) => {
  const now = new Date();
  res.json({
    status: 'online',
    message: 'API Prova de Vida v1.1.2 está funcionando!',
    version: '1.1.2',
    lastUpdate: now.toISOString(),
    environment: process.env.NODE_ENV || 'production',
    serverTime: {
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR')
    },
    availableEndpoints: {
      auth: '/auth - Autenticação e gerenciamento de usuários',
      organizations: '/organizations - Gerenciamento de organizações',
      users: '/users - Gerenciamento de usuários',
      proofOfLife: '/proof-of-life - Prova de vida',
      recadastration: '/recadastration - Recadastramento',
      uploads: '/uploads - Upload de arquivos',
      dashboard: '/dashboard - Dados do dashboard',
      events: '/events - Gerenciamento de eventos'
    }
  });
});

routes.use('/auth', authRoutes);
routes.use('/organizations', organizationRoutes);
routes.use('/users', userRoutes);
routes.use('/proof-of-life', proofOfLifeRoutes);
routes.use('/recadastration', recadastrationRoutes);
routes.use('/uploads', uploadRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/events', eventRoutes);

export { routes };