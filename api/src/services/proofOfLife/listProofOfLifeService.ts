import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface ListProofOfLifeRequest {
  organizationId: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  userId?: string;
}

interface ProofOfLifeRow {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  selfie_url: string;
  document_url: string;
  comments?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  user_cpf: string;
  event_title?: string;
  reviewer_name?: string;
}

export class ListProofOfLifeService {
  async execute({ organizationId, status, userId }: ListProofOfLifeRequest) {
    const mainDb = db.getMainDb();

    const organization = mainDb.prepare(`
      SELECT subdomain FROM organizations 
      WHERE id = ? AND active = 1
    `).get(organizationId) as { subdomain: string } | undefined;

    if (!organization) {
      throw new AppError('Organização não encontrada');
    }

    const organizationDb = await db.getOrganizationDb(organization.subdomain);

    let query = `
      SELECT 
        p.*,
        u.name as user_name,
        u.cpf as user_cpf,
        e.title as event_title,
        ru.name as reviewer_name
      FROM proof_of_life p
      INNER JOIN app_users u ON u.id = p.user_id
      LEFT JOIN events e ON e.id = p.event_id
      LEFT JOIN admin_users ru ON ru.id = p.reviewed_by
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (userId) {
      query += ' AND p.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY p.created_at DESC';

    const proofs = organizationDb.prepare(query).all(...params) as ProofOfLifeRow[];

    return proofs.map(proof => ({
      id: proof.id,
      status: proof.status,
      selfieUrl: proof.selfie_url,
      documentUrl: proof.document_url,
      comments: proof.comments,
      reviewedAt: proof.reviewed_at,
      reviewedBy: proof.reviewer_name,
      createdAt: proof.created_at,
      updatedAt: proof.updated_at,
      event: proof.event_title ? {
        title: proof.event_title
      } : null,
      user: {
        id: proof.user_id,
        name: proof.user_name,
        cpf: proof.user_cpf
      }
    }));
  }
}