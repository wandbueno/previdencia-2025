import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp } from '../../utils/database';

const PROOF_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

type ProofStatus = keyof typeof PROOF_STATUS;

interface ReviewProofOfLifeRequest {
  id: string;
  organizationId: string;
  reviewerId: string;
  status: ProofStatus;
  comments?: string;
}

interface ProofOfLife {
  id: string;
  user_id: string;
  status: ProofStatus;
  selfie_url: string;
  document_url: string;
  comments?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export class ReviewProofOfLifeService {
  async execute({ id, organizationId, reviewerId, status, comments }: ReviewProofOfLifeRequest) {
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

    const organizationDb = db.getOrganizationDb(organization.subdomain);

    // Get proof of life record
    const proof = organizationDb.prepare(`
      SELECT p.*, u.name as user_name, u.cpf as user_cpf
      FROM proof_of_life p
      INNER JOIN users u ON u.id = p.user_id
      WHERE p.id = ?
    `).get(id) as (ProofOfLife & { user_name: string; user_cpf: string }) | undefined;

    if (!proof) {
      throw new AppError('Prova de vida não encontrada');
    }

    if (proof.status !== 'PENDING') {
      throw new AppError('Esta prova de vida já foi revisada');
    }

    const timestamp = getCurrentTimestamp();

    // Update proof of life record
    organizationDb.prepare(`
      UPDATE proof_of_life
      SET status = ?,
          comments = ?,
          reviewed_at = ?,
          reviewed_by = ?,
          updated_at = ?
      WHERE id = ?
    `).run(status, comments || null, timestamp, reviewerId, timestamp, id);

    return {
      id: proof.id,
      status,
      selfieUrl: proof.selfie_url,
      documentUrl: proof.document_url,
      comments,
      reviewedAt: timestamp,
      reviewedBy: reviewerId,
      createdAt: proof.created_at,
      updatedAt: timestamp,
      user: {
        id: proof.user_id,
        name: proof.user_name,
        cpf: proof.user_cpf
      }
    };
  }
}