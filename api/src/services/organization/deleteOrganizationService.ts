import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { Organization } from '../../types/organization';

export class DeleteOrganizationService {
  async execute(id: string): Promise<void> {
    try {
      const mainDb = db.getMainDb();

      // Verificar se a organização existe
      const organization = mainDb.prepare(`
        SELECT subdomain FROM organizations WHERE id = ?
      `).get(id);

      if (!organization) {
        throw new AppError('Organização não encontrada', 404);
      }

      // Deletar organização
      mainDb.prepare(`
        DELETE FROM organizations WHERE id = ?
      `).run(id);

    } catch (error) {
      console.error('Error in DeleteOrganizationService:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error deleting organization');
    }
  }
}