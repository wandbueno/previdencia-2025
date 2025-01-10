import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface ListProofOfLifeRequest {
  organizationId: string;
  status?: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  userId?: string;
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
}

export class ListProofOfLifeService {
  async execute({ organizationId, status, userId }: ListProofOfLifeRequest) {
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

      // Build the base query
      let query = `
        SELECT 
          p.*,
          u.name as user_name,
          u.cpf as user_cpf,
          e.title as event_title,
          e.id as event_id
        FROM proof_of_life p
        INNER JOIN app_users u ON u.id = p.user_id
        INNER JOIN events e ON e.id = p.event_id
      `;

      const whereConditions = [];
      const params = [];

      // Add filters
      if (status) {
        whereConditions.push('p.status = ?');
        params.push(status);
      }

      if (userId) {
        whereConditions.push('p.user_id = ?');
        params.push(userId);
      }

      // Add WHERE clause if there are conditions
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }

      // Add ordering
      query += ' ORDER BY p.created_at DESC';

      // Execute query
      const proofs = organizationDb.prepare(query).all(...params) as ProofOfLifeRecord[];

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
          title: proof.event_title
        }
      }));
    } catch (error) {
      console.error('Error listing proofs:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error listing proofs');
    }
  }
}