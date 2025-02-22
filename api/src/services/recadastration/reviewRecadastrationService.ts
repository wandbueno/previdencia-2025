import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp } from '../../utils/database';
import Database from 'better-sqlite3';

const RECADASTRATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

type RecadastrationStatus = keyof typeof RECADASTRATION_STATUS;

interface ReviewRecadastrationRequest {
  id: string;
  organizationId: string;
  reviewerId: string;
  status: RecadastrationStatus;
  comments?: string;
}

interface Recadastration {
  id: string;
  user_id: string;
  status: RecadastrationStatus;
  data: string;
  documents_urls: string;
  comments?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export class ReviewRecadastrationService {
  async execute({ id, organizationId, reviewerId, status, comments }: ReviewRecadastrationRequest) {
    const mainDb = db.getMainDb();

    // Get organization subdomain
    const organization = mainDb.prepare(`
      SELECT subdomain, services
      FROM organizations
      WHERE id = ? AND active = 1
    `).get(organizationId) as { subdomain: string; services: string } | undefined;

    if (!organization) {
      throw new AppError('Organização não encontrada');
    }

    const services = JSON.parse(organization.services);
    if (!services.includes('RECADASTRATION')) {
      throw new AppError('Serviço de Recadastramento não disponível');
    }

    const organizationDb = db.getOrganizationDb(organization.subdomain) as Database.Database;

    // Get recadastration record
    const recadastration = organizationDb.prepare(`
      SELECT r.*, u.name as user_name, u.cpf as user_cpf
      FROM recadastration r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.id = ?
    `).get(id) as (Recadastration & { user_name: string; user_cpf: string }) | undefined;

    if (!recadastration) {
      throw new AppError('Recadastramento não encontrado');
    }

    if (recadastration.status !== 'PENDING') {
      throw new AppError('Este recadastramento já foi revisado');
    }

    const timestamp = getCurrentTimestamp();

    // Update recadastration record
    organizationDb.prepare(`
      UPDATE recadastration
      SET status = ?,
          comments = ?,
          reviewed_at = ?,
          reviewed_by = ?,
          updated_at = ?
      WHERE id = ?
    `).run(status, comments || null, timestamp, reviewerId, timestamp, id);

    return {
      id: recadastration.id,
      status,
      data: JSON.parse(recadastration.data),
      documentsUrls: JSON.parse(recadastration.documents_urls),
      comments,
      reviewedAt: timestamp,
      reviewedBy: reviewerId,
      createdAt: recadastration.created_at,
      updatedAt: timestamp,
      user: {
        id: recadastration.user_id,
        name: recadastration.user_name,
        cpf: recadastration.user_cpf
      }
    };
  }
}