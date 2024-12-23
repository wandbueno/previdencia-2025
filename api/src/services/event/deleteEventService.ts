import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

export class DeleteEventService {
  async execute({ id, organizationId }: { id: string; organizationId: string }) {
    console.log('Delete Event Params:', { id, organizationId });
    
    const mainDb = db.getMainDb();
    
    const organization = mainDb.prepare(`
      SELECT subdomain FROM organizations 
      WHERE id = ? AND active = 1
    `).get(organizationId) as { subdomain: string } | undefined;

    console.log('Organization found:', organization);

    if (!organization) {
      throw new AppError('Organização não encontrada ou inativa');
    }

    const organizationDb = await db.getOrganizationDb(organization.subdomain);

    const result = organizationDb.prepare(`
      DELETE FROM events 
      WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      throw new AppError('Evento não encontrado');
    }
  }
} 