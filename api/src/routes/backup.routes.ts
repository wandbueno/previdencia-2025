import { Router } from 'express';
import { CreateBackupController } from '../controllers/backup/createBackupController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureSuperAdmin } from '../middlewares/ensureSuperAdmin';

const backupRoutes = Router();
const createBackupController = new CreateBackupController();

// Aplicar middleware de autenticação para todas as rotas
backupRoutes.use(ensureAuthenticated);
backupRoutes.use(ensureSuperAdmin); // Apenas superadmin pode acessar estas rotas

// Rotas de backup
backupRoutes.post('/', createBackupController.handle.bind(createBackupController));
backupRoutes.get('/', createBackupController.listBackups.bind(createBackupController));
backupRoutes.get('/download/:filename', createBackupController.downloadBackup.bind(createBackupController));
backupRoutes.delete('/:filename', createBackupController.deleteBackup.bind(createBackupController));

export { backupRoutes };
