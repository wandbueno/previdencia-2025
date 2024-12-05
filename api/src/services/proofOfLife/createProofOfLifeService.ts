import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { generateId, getCurrentTimestamp } from '../../utils/database';

interface CreateProofOfLifeRequest {
  userId: string;
  organizationId: string;
  selfieUrl: string;
  documentUrl: string;
}

export class CreateProofOfLifeService {
  async execute({ userId, organizationId, selfieUrl, documentUrl }: CreateProofOfLifeRequest) {
    const mainDb = db.getMainDb();

    // Check if organization exists and has PROOF_OF_LIFE service active
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

    // Check if user belongs to organization
    const user = organizationDb.prepare(`
      SELECT id, active
      FROM users
      WHERE id = ?
    `).get(userId) as { id: string; active: number } | undefined;

    if (!user || !user.active) {
      throw new AppError('Usuário não encontrado');
    }

    // Check if there's already a pending proof of life
    const pendingProof = organizationDb.prepare(`
      SELECT 1
      FROM proof_of_life
      WHERE user_id = ? AND status = 'PENDING'
    `).get(userId);

    if (pendingProof) {
      throw new AppError('Já existe uma prova de vida pendente');
    }

    const id = generateId();
    const timestamp = getCurrentTimestamp();

    // Create proof of life record
    organizationDb.prepare(`
      INSERT INTO proof_of_life (
        id,
        user_id,
        selfie_url,
        document_url,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, selfieUrl, documentUrl, timestamp, timestamp);

    return {
      id,
      userId,
      selfieUrl,
      documentUrl,
      status: 'PENDING',
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }
}