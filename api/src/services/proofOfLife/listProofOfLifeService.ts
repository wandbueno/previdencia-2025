import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface ListProofOfLifeRequest {
  organizationId: string;
  userId?: string;
}

interface ProofOfLifeHistory {
  id: string;
  eventId: string;
  eventTitle: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  selfieUrl: string;
  documentUrl: string;
  comments?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class ListProofOfLifeService {
  async execute({ organizationId, userId }: ListProofOfLifeRequest) {
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

      // Get proofs with event and reviewer information
      const query = `
        SELECT 
          p.id,
          p.event_id,
          e.title as event_title,
          p.status,
          p.selfie_url,
          p.document_url,
          p.comments,
          p.created_at as submitted_at,
          p.reviewed_at,
          p.reviewed_by,
          a.name as reviewer_name,
          p.created_at,
          p.updated_at
        FROM proof_of_life p
        INNER JOIN events e ON e.id = p.event_id
        LEFT JOIN admin_users a ON a.id = p.reviewed_by
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
      `;

      const proofs = organizationDb.prepare(query).all(userId) as Array<{
        id: string;
        event_id: string;
        event_title: string;
        status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
        selfie_url: string;
        document_url: string;
        comments?: string;
        submitted_at: string;
        reviewed_at?: string;
        reviewed_by?: string;
        reviewer_name?: string;
        created_at: string;
        updated_at: string;
      }>;

      return proofs.map(proof => ({
        id: proof.id,
        eventId: proof.event_id,
        eventTitle: proof.event_title,
        status: proof.status,
        selfieUrl: proof.selfie_url,
        documentUrl: proof.document_url,
        comments: proof.comments,
        submittedAt: proof.submitted_at,
        reviewedAt: proof.reviewed_at,
        reviewedBy: proof.reviewed_by ? {
          id: proof.reviewed_by,
          name: proof.reviewer_name || 'Administrador'
        } : undefined,
        createdAt: proof.created_at,
        updatedAt: proof.updated_at
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error listing proofs of life:', error);
      throw new AppError('Error listing proofs of life');
    }
  }
}