import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import Database from 'better-sqlite3';

const RECADASTRATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

type RecadastrationStatus = keyof typeof RECADASTRATION_STATUS;

interface ListRecadastrationRequest {
  organizationId: string;
  status?: RecadastrationStatus;
  userId?: string;
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

export class ListRecadastrationService {
  async execute({ organizationId, status, userId }: ListRecadastrationRequest) {
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

    let query = `
      SELECT 
        r.*,
        u.name as user_name,
        u.cpf as user_cpf
      FROM recadastration r
      INNER JOIN users u ON u.id = r.user_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (userId) {
      query += ' AND r.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY r.created_at DESC';

    const recadastrations = organizationDb.prepare(query).all(...params) as (Recadastration & {
      user_name: string;
      user_cpf: string;
    })[];

    return recadastrations.map(recadastration => ({
      id: recadastration.id,
      status: recadastration.status,
      data: JSON.parse(recadastration.data),
      documentsUrls: JSON.parse(recadastration.documents_urls),
      comments: recadastration.comments,
      reviewedAt: recadastration.reviewed_at,
      reviewedBy: recadastration.reviewed_by,
      createdAt: recadastration.created_at,
      updatedAt: recadastration.updated_at,
      user: {
        id: recadastration.user_id,
        name: recadastration.user_name,
        cpf: recadastration.user_cpf
      }
    }));
  }
}