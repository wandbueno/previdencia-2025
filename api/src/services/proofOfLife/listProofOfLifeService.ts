import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface ListProofOfLifeRequest {
  organizationId: string;
  status?: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  userId?: string;
  history?: boolean; // Indica se é listagem de histórico (app) ou admin (web)
}

interface ProofOfLifeRecord {
  id: string;
  user_id: string;
  event_id: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  selfie_url: string;
  document_url: string;
  comments: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_cpf: string;
  event_title: string;
  reviewer_name: string | null;
}

export class ListProofOfLifeService {
  async execute({ organizationId, status, userId, history = false }: ListProofOfLifeRequest) {
    try {
      const mainDb = db.getMainDb();

      // Get organization
      const organization = mainDb.prepare(`
        SELECT subdomain, services
        FROM organizations
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string; services: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const services = JSON.parse(organization.services);
      if (!services.includes('PROOF_OF_LIFE')) {
        throw new AppError('Proof of Life service not available');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Se for histórico (app), filtra pelo userId
      if (history && userId) {
        const query = `
          SELECT 
            p.*,
            u.name as user_name,
            u.cpf as user_cpf,
            e.title as event_title,
            a.name as reviewer_name
          FROM proof_of_life p
          INNER JOIN app_users u ON u.id = p.user_id
          INNER JOIN events e ON e.id = p.event_id
          LEFT JOIN admin_users a ON a.id = p.reviewed_by
          WHERE p.user_id = ?
          ${status ? 'AND p.status = ?' : ''}
          ORDER BY p.created_at DESC
        `;

        const params = status ? [userId, status] : [userId];
        const proofs = organizationDb.prepare(query).all(...params) as ProofOfLifeRecord[];

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
          user: {
            id: proof.user_id,
            name: proof.user_name,
            cpf: proof.user_cpf
          },
          event: {
            id: proof.event_id,
            title: proof.event_title
          }
        }));
      }

      // Se não for histórico (web/admin), lista todas as provas
      const query = `
        SELECT 
          p.*,
          u.name as user_name,
          u.cpf as user_cpf,
          e.title as event_title,
          a.name as reviewer_name
        FROM proof_of_life p
        INNER JOIN app_users u ON u.id = p.user_id
        INNER JOIN events e ON e.id = p.event_id
        LEFT JOIN admin_users a ON a.id = p.reviewed_by
        ${status ? 'WHERE p.status = ?' : ''}
        ORDER BY p.created_at DESC
      `;

      const params = status ? [status] : [];
      const proofs = organizationDb.prepare(query).all(...params) as ProofOfLifeRecord[];

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
        user: {
          id: proof.user_id,
          name: proof.user_name,
          cpf: proof.user_cpf
        },
        event: {
          id: proof.event_id,
          title: proof.event_title
        }
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error listing proofs:', error);
      throw new AppError('Error listing proofs');
    }
  }
}