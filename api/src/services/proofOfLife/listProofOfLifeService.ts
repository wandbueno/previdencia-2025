import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

const PROOF_STATUS = {
  PENDING: 'PENDING',     // Inicial - Pendente de envio
  SUBMITTED: 'SUBMITTED', // Enviado - Em análise
  APPROVED: 'APPROVED',   // Aprovado pelo admin
  REJECTED: 'REJECTED'    // Rejeitado pelo admin
} as const;

type ProofStatus = keyof typeof PROOF_STATUS;

interface ListProofOfLifeRequest {
  organizationId: string;
  status?: ProofStatus;
  userId?: string;
}

interface ProofOfLife {
  id: string;
  user_id: string;
  event_id: string;
  status: ProofStatus;
  selfie_url: string;
  document_url: string;
  comments?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export class ListProofOfLifeService {
  async execute({ organizationId, status, userId }: ListProofOfLifeRequest) {
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
    if (!services.includes('PROOF_OF_LIFE')) {
      throw new AppError('Serviço de Prova de Vida não disponível');
    }

    const organizationDb = await db.getOrganizationDb(organization.subdomain);

    let query = `
      SELECT 
        p.*,
        u.name as user_name,
        u.cpf as user_cpf,
        e.title as event_title,
        e.start_date as event_start_date,
        e.end_date as event_end_date
      FROM proof_of_life p
      INNER JOIN app_users u ON u.id = p.user_id
      INNER JOIN events e ON e.id = p.event_id
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

    const proofs = organizationDb.prepare(query).all(...params) as (ProofOfLife & {
      user_name: string;
      user_cpf: string;
      event_title: string;
      event_start_date: string;
      event_end_date: string;
    })[];

    return proofs.map(proof => ({
      id: proof.id,
      status: proof.status,
      selfieUrl: proof.selfie_url,
      documentUrl: proof.document_url,
      comments: proof.comments,
      reviewedAt: proof.reviewed_at,
      reviewedBy: proof.reviewed_by,
      createdAt: proof.created_at,
      updatedAt: proof.updated_at,
      user: {
        id: proof.user_id,
        name: proof.user_name,
        cpf: proof.user_cpf
      },
      event: {
        id: proof.event_id,
        title: proof.event_title,
        startDate: proof.event_start_date,
        endDate: proof.event_end_date
      }
    }));
  }
}