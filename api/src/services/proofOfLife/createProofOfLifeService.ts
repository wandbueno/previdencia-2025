// api/src/services/proofOfLife/createProofOfLifeService.ts
import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { generateId, getCurrentTimestamp } from '../../utils/database';
import { FileSystem } from '../../utils/fileSystem';

interface CreateProofOfLifeRequest {
  userId: string;
  organizationId: string;
  selfieUrl: string;
  documentFrontUrl: string;
  documentBackUrl: string;
  cpfUrl: string;
  eventId: string;
}

export class CreateProofOfLifeService {
  async execute({ 
    userId, 
    organizationId, 
    selfieUrl, 
    documentFrontUrl,
    documentBackUrl, 
    cpfUrl,
    eventId 
  }: CreateProofOfLifeRequest) {
    try {
      const mainDb = db.getMainDb();

      // Check if organization exists and has PROOF_OF_LIFE service active
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

      // Check if user exists and is active
      const user = organizationDb.prepare(`
        SELECT id, active, can_proof_of_life
        FROM app_users
        WHERE id = ?
      `).get(userId) as { id: string; active: number; can_proof_of_life: number } | undefined;

      if (!user || !user.active) {
        throw new AppError('User not found or inactive');
      }

      if (!user.can_proof_of_life) {
        throw new AppError('User not authorized for proof of life');
      }

      // Check if event exists and is active
      const event = organizationDb.prepare(`
        SELECT id, active, start_date, end_date 
        FROM events 
        WHERE id = ? AND type = 'PROOF_OF_LIFE'
      `).get(eventId) as { id: string; active: number; start_date: string; end_date: string } | undefined;

      if (!event) {
        throw new AppError('Event not found');
      }

      if (!event.active) {
        throw new AppError('Event is not active');
      }

      // Check if event is within valid date range
      const now = new Date();
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);

      if (now < startDate || now > endDate) {
        throw new AppError('Event is not within valid date range');
      }

      // Check if user has any pending or submitted proof for this event
      const existingProof = organizationDb.prepare(`
        SELECT id, status 
        FROM proof_of_life 
        WHERE user_id = ? 
        AND event_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(userId, eventId) as { id: string; status: string } | undefined;

      // Verifica se pode enviar/reenviar a prova:
      // 1. Não existe prova anterior
      // 2. A última prova foi rejeitada
      // 3. Não permite se estiver pendente, em análise ou aprovada
      if (existingProof && existingProof.status !== 'REJECTED') {
        const statusMessages = {
          PENDING: 'Você já tem uma prova de vida pendente para este evento',
          SUBMITTED: 'Sua prova de vida está em análise',
          APPROVED: 'Sua prova de vida já foi aprovada'
        };
        throw new AppError(statusMessages[existingProof.status as keyof typeof statusMessages] || 'Você já tem uma prova de vida para este evento');
      }

      const id = existingProof?.id || generateId();
      const timestamp = getCurrentTimestamp();

      // Normalize file paths
      const normalizedSelfieUrl = FileSystem.normalizePath(selfieUrl);
      const normalizedDocumentFrontUrl = FileSystem.normalizePath(documentFrontUrl);
      const normalizedDocumentBackUrl = FileSystem.normalizePath(documentBackUrl);
      const normalizedCpfUrl = FileSystem.normalizePath(cpfUrl);

      // Inicia transação
      organizationDb.exec('BEGIN TRANSACTION');

      try {
        if (existingProof) {
          // Update existing proof
          organizationDb.prepare(`
            UPDATE proof_of_life 
            SET status = 'SUBMITTED',
                selfie_url = ?,
                document_front_url = ?,
                document_back_url = ?,
                cpf_url = ?,
                reviewed_at = NULL,
                reviewed_by = NULL,
                comments = NULL,
                updated_at = ?
            WHERE id = ?
          `).run(
            normalizedSelfieUrl, 
            normalizedDocumentFrontUrl,
            normalizedDocumentBackUrl,
            normalizedCpfUrl,
            timestamp, 
            id
          );
        } else {
          // Create new proof
          organizationDb.prepare(`
            INSERT INTO proof_of_life (
              id, user_id, event_id, status,
              selfie_url, document_front_url, document_back_url, cpf_url,
              created_at, updated_at
            ) VALUES (?, ?, ?, 'SUBMITTED', ?, ?, ?, ?, ?, ?)
          `).run(
            id,
            userId,
            eventId,
            normalizedSelfieUrl,
            normalizedDocumentFrontUrl,
            normalizedDocumentBackUrl,
            normalizedCpfUrl,
            timestamp,
            timestamp
          );
        }

        // Add history entry
        const historyId = generateId();
        console.log(`[HISTORY CREATE] Criando registro de histórico para proof_id: ${id}, user_id: ${userId}, event_id: ${eventId}, action: ${existingProof ? 'RESUBMITTED' : 'SUBMITTED'}`);
        
        try {
          organizationDb.prepare(`
            INSERT INTO proof_of_life_history (
              id, proof_id, user_id, event_id, action, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            historyId,
            id,
            userId,
            eventId,
            existingProof ? 'RESUBMITTED' : 'SUBMITTED',
            timestamp
          );
          
          console.log(`[HISTORY CREATE] Histórico criado com sucesso, id: ${historyId}`);
          
          // Verificar se o registro foi realmente inserido
          const historyCheck = organizationDb.prepare(`SELECT COUNT(*) as count FROM proof_of_life_history WHERE id = ?`).get(historyId) as { count: number };
          console.log(`[HISTORY CREATE] Verificação de inserção: ${historyCheck.count} registros encontrados para history_id=${historyId}`);
        } catch (error) {
          console.error('[HISTORY CREATE] Erro ao criar histórico:', error);
          // Não vamos lançar erro aqui para não impedir o fluxo principal
          // mas vamos registrar detalhadamente o problema
        }

        // Commit transação
        organizationDb.exec('COMMIT');

        return {
          id,
          userId,
          eventId,
          status: 'SUBMITTED' as const,
          selfieUrl: normalizedSelfieUrl,
          documentFrontUrl: normalizedDocumentFrontUrl,
          documentBackUrl: normalizedDocumentBackUrl,
          cpfUrl: normalizedCpfUrl,
          createdAt: timestamp,
          updatedAt: timestamp
        };
      } catch (error) {
        // Rollback em caso de erro
        organizationDb.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating proof of life:', error);
      throw error instanceof AppError ? error : new AppError('Error creating proof of life');
    }
  }
}
