import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface UpdateOrganizationLogoRequest {
  organizationId: string;
  logoUrl: string;
}

export class UpdateOrganizationLogoService {
  async execute({ organizationId, logoUrl }: UpdateOrganizationLogoRequest) {
    try {
      const mainDb = db.getMainDb();

      // Verificar se a organização existe
      const organizationExists = mainDb.prepare(
        'SELECT id FROM organizations WHERE id = ?'
      ).get(organizationId);

      if (!organizationExists) {
        throw new AppError('Organization not found', 404);
      }

      // Atualizar a logo da organização
      mainDb.prepare(
        'UPDATE organizations SET logo_url = ? WHERE id = ?'
      ).run(logoUrl, organizationId);

      // Buscar a organização atualizada
      const organization = mainDb.prepare(
        'SELECT * FROM organizations WHERE id = ?'
      ).get(organizationId);

      return organization;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error updating organization logo');
    }
  }
}
