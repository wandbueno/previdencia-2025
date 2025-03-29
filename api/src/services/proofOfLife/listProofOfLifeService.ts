// api/src/services/proofOfLife/listProofOfLifeService.ts
import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface ListProofOfLifeRequest {
  organizationId: string;
  status?: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  userId?: string;
  history?: boolean;
}

interface ProofOfLifeRecord {
  id: string;
  user_id: string;
  event_id: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  selfie_url: string;
  document_front_url: string;
  document_back_url: string;
  cpf_url: string;
  comments: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_cpf: string;
  user_rg: string;
  user_email: string;
  user_birth_date: string;
  user_address: string;
  user_phone: string;
  user_registration_number: string;
  user_process_number: string;
  user_benefit_start_date: string;
  user_benefit_end_date: string;
  user_benefit_type: string;
  user_retirement_type: string;
  user_insured_name: string;
  user_legal_representative: string;
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
            u.rg as user_rg,
            u.email as user_email,
            u.birth_date as user_birth_date,
            u.address as user_address,
            u.phone as user_phone,
            u.registration_number as user_registration_number,
            u.process_number as user_process_number,
            u.benefit_start_date as user_benefit_start_date,
            u.benefit_end_date as user_benefit_end_date,
            u.benefit_type as user_benefit_type,
            u.retirement_type as user_retirement_type,
            u.insured_name as user_insured_name,
            u.legal_representative as user_legal_representative,
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
          documentFrontUrl: proof.document_front_url,
          documentBackUrl: proof.document_back_url,
          cpfUrl: proof.cpf_url,
          comments: proof.comments,
          reviewedAt: proof.reviewed_at,
          reviewedBy: proof.reviewer_name,
          createdAt: proof.created_at,
          updatedAt: proof.updated_at,
          user: {
            id: proof.user_id,
            name: proof.user_name,
            cpf: proof.user_cpf,
            rg: proof.user_rg,
            email: proof.user_email,
            birthDate: proof.user_birth_date,
            address: proof.user_address,
            phone: proof.user_phone,
            registrationNumber: proof.user_registration_number,
            processNumber: proof.user_process_number,
            benefitStartDate: proof.user_benefit_start_date,
            benefitEndDate: proof.user_benefit_end_date,
            benefitType: proof.user_benefit_type,
            retirementType: proof.user_retirement_type,
            insuredName: proof.user_insured_name,
            legalRepresentative: proof.user_legal_representative
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
          u.rg as user_rg,
          u.email as user_email,
          u.birth_date as user_birth_date,
          u.address as user_address,
          u.phone as user_phone,
          u.registration_number as user_registration_number,
          u.process_number as user_process_number,
          u.benefit_start_date as user_benefit_start_date,
          u.benefit_end_date as user_benefit_end_date,
          u.benefit_type as user_benefit_type,
          u.retirement_type as user_retirement_type,
          u.insured_name as user_insured_name,
          u.legal_representative as user_legal_representative,
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
        documentFrontUrl: proof.document_front_url,
        documentBackUrl: proof.document_back_url,
        cpfUrl: proof.cpf_url,
        comments: proof.comments,
        reviewedAt: proof.reviewed_at,
        reviewedBy: proof.reviewer_name,
        createdAt: proof.created_at,
        updatedAt: proof.updated_at,
        user: {
          id: proof.user_id,
          name: proof.user_name,
          cpf: proof.user_cpf,
          rg: proof.user_rg,
          email: proof.user_email,
          birthDate: proof.user_birth_date,
          address: proof.user_address,
          phone: proof.user_phone,
          registrationNumber: proof.user_registration_number,
          processNumber: proof.user_process_number,
          benefitStartDate: proof.user_benefit_start_date,
          benefitEndDate: proof.user_benefit_end_date,
          benefitType: proof.user_benefit_type,
          retirementType: proof.user_retirement_type,
          insuredName: proof.user_insured_name,
          legalRepresentative: proof.user_legal_representative
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