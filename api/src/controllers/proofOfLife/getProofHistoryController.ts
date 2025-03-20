import { Request, Response } from 'express';
import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

export class GetProofHistoryController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { organizationId, id: userId, role } = request.user;

      console.log(`[HISTORY DEBUG] Buscando histórico para proof_id: ${id}, user_id: ${userId}, role: ${role}`);

      if (!organizationId) {
        throw new AppError('Organization ID not found', 401);
      }

      const mainDb = db.getMainDb();
      
      const organization = mainDb.prepare(`
        SELECT subdomain FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      console.log(`[HISTORY DEBUG] Conectando ao banco de dados da organização: ${organization.subdomain}`);
      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Busca o histórico filtrando pelo user_id (se não for admin)
      const query = role === 'USER' 
        ? `
          SELECT 
            h.*,
            a.name as reviewer_name,
            p.selfie_url,
            p.document_front_url,
            p.document_back_url,
            p.cpf_url,
            CASE 
              WHEN h.action = 'SUBMITTED' THEN 'Prova de vida enviada'
              WHEN h.action = 'RESUBMITTED' THEN 'Prova de vida reenviada'
              WHEN h.action = 'APPROVED' THEN 'Prova de vida aprovada'
              WHEN h.action = 'REJECTED' THEN 'Prova de vida rejeitada'
              ELSE ''
            END as action_description
          FROM proof_of_life_history h
          LEFT JOIN admin_users a ON a.id = h.reviewed_by
          LEFT JOIN proof_of_life p ON p.id = h.proof_id
          WHERE h.proof_id = ? AND h.user_id = ?
          ORDER BY h.created_at ASC
        `
        : `
          SELECT 
            h.*,
            a.name as reviewer_name,
            p.selfie_url,
            p.document_front_url,
            p.document_back_url,
            p.cpf_url,
            CASE 
              WHEN h.action = 'SUBMITTED' THEN 'Prova de vida enviada'
              WHEN h.action = 'RESUBMITTED' THEN 'Prova de vida reenviada'
              WHEN h.action = 'APPROVED' THEN 'Prova de vida aprovada'
              WHEN h.action = 'REJECTED' THEN 'Prova de vida rejeitada'
              ELSE ''
            END as action_description
          FROM proof_of_life_history h
          LEFT JOIN admin_users a ON a.id = h.reviewed_by
          LEFT JOIN proof_of_life p ON p.id = h.proof_id
          WHERE h.proof_id = ?
          ORDER BY h.created_at ASC
        `;

      const params = role === 'USER' ? [id, userId] : [id];
      console.log(`[HISTORY DEBUG] Executando query com parâmetros:`, params);
      
      const history = organizationDb.prepare(query).all(...params);
      console.log(`[HISTORY DEBUG] Histórico encontrado: ${history.length} registros`);
      
      // Verificar se existe registro na tabela proof_of_life mesmo sem histórico
      if (history.length === 0) {
        const proofExists = organizationDb.prepare(`
          SELECT COUNT(*) as count FROM proof_of_life WHERE id = ?
        `).get(id) as { count: number };
        
        console.log(`[HISTORY DEBUG] Verificação adicional: ${proofExists.count} registros encontrados na tabela proof_of_life para id=${id}`);
      }

      return response.json(history);
    } catch (error) {
      console.error('[HISTORY DEBUG] Erro ao buscar histórico:', error);
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error getting proof history:', error);
      throw new AppError('Error getting proof history');
    }
  }
}
