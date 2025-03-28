// api/src/services/proofOfLife/reviewProofOfLifeService.ts
import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { generateId, getCurrentTimestamp } from '../../utils/database';

interface ReviewProofOfLifeRequest {
  id: string;
  organizationId: string;
  reviewerId: string;
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
}

export class ReviewProofOfLifeService {
  async execute({ id, organizationId, reviewerId, status, comments }: ReviewProofOfLifeRequest) {
    try {
      const mainDb = db.getMainDb();

      // Get organization subdomain
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

      // Get proof of life record with user and event info
      const proof = organizationDb.prepare(`
        SELECT p.*, u.name as user_name, u.cpf as user_cpf
        FROM proof_of_life p
        INNER JOIN app_users u ON u.id = p.user_id
        WHERE p.id = ?
      `).get(id) as { 
        id: string; 
        status: string; 
        user_name: string; 
        user_cpf: string;
        user_id: string;
        event_id: string;
        selfie_url: string;
        document_front_url: string;
        document_back_url: string;
        cpf_url: string;
      } | undefined;

      if (!proof) {
        throw new AppError('Proof of life not found');
      }

      // Permite revisar apenas provas que estão em análise
      if (proof.status !== 'SUBMITTED') {
        throw new AppError('This proof of life cannot be reviewed');
      }

      const timestamp = getCurrentTimestamp();

      // Inicia transação
      organizationDb.exec('BEGIN TRANSACTION');

      try {
        // Update proof of life status
        organizationDb.prepare(`
          UPDATE proof_of_life
          SET status = ?,
              comments = ?,
              reviewed_at = ?,
              reviewed_by = ?,
              updated_at = ?
          WHERE id = ?
        `).run(status, comments || null, timestamp, reviewerId, timestamp, id);

        // Add history entry
        const historyId = generateId();
        console.log(`[HISTORY REVIEW] Criando registro de revisão para proof_id: ${proof.id}, user_id: ${proof.user_id}, event_id: ${proof.event_id}, action: ${status}`);
        
        try {
          organizationDb.prepare(`
            INSERT INTO proof_of_life_history (
              id, proof_id, user_id, event_id, action, comments, reviewed_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            historyId,
            proof.id,
            proof.user_id,
            proof.event_id,
            status,
            comments || null,
            reviewerId,
            timestamp
          );
          
          console.log(`[HISTORY REVIEW] Histórico de revisão criado com sucesso, id: ${historyId}`);
          
          // Verificar se o registro foi realmente inserido
          const historyCheck = organizationDb.prepare(`SELECT COUNT(*) as count FROM proof_of_life_history WHERE id = ?`).get(historyId) as { count: number };
          console.log(`[HISTORY REVIEW] Verificação de inserção: ${historyCheck.count} registros encontrados para history_id=${historyId}`);
        } catch (error) {
          console.error('[HISTORY REVIEW] Erro ao criar histórico de revisão:', error);
          // Não vamos lançar erro aqui para não impedir o fluxo principal
          // mas vamos registrar detalhadamente o problema
        }

        // Commit transação
        organizationDb.exec('COMMIT');

        return {
          id: proof.id,
          status,
          comments,
          reviewedAt: timestamp,
          reviewedBy: reviewerId,
          selfieUrl: proof.selfie_url,
          documentFrontUrl: proof.document_front_url,
          documentBackUrl: proof.document_back_url,
          cpfUrl: proof.cpf_url,
          user: {
            name: proof.user_name,
            cpf: proof.user_cpf
          }
        };
      } catch (error) {
        // Rollback em caso de erro
        organizationDb.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error reviewing proof of life:', error);
      throw error instanceof AppError ? error : new AppError('Error reviewing proof of life');
    }
  }
}