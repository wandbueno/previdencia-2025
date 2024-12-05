import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import fs from 'fs/promises';
import path from 'path';

export class DeleteOrganizationService {
  async execute(id: string) {
    const mainDb = db.getMainDb();

    const organization = mainDb.prepare(
      'SELECT subdomain FROM organizations WHERE id = ?'
    ).get(id) as { subdomain: string } | undefined;

    if (!organization) {
      throw new AppError('Organização não encontrada');
    }

    try {
      // Delete organization from main database
      mainDb.prepare('DELETE FROM organizations WHERE id = ?').run(id);

      // Delete organization database file
      const databasePath = path.join(process.cwd(), 'data', 'organizations', `${organization.subdomain}.db`);
      try {
        await fs.unlink(databasePath);
      } catch (error) {
        console.error('Error deleting organization database:', error);
      }

      // Delete organization uploads directory
      const uploadsDir = path.join(process.cwd(), 'uploads', id);
      try {
        await fs.rm(uploadsDir, { recursive: true, force: true });
      } catch (error) {
        console.error('Error deleting organization uploads:', error);
      }

    } catch (error) {
      console.error('Error deleting organization:', error);
      throw new AppError('Erro ao excluir organização');
    }
  }
}