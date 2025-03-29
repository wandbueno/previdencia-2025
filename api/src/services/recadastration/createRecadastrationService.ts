import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { generateId, getCurrentTimestamp, stringifyJSON } from '../../utils/database';
import Database from 'better-sqlite3';

interface CreateRecadastrationRequest {
  userId: string;
  organizationId: string;
  data: {
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    dependents?: Array<{
      name: string;
      birthDate: string;
      relationship: string;
    }>;
  };
  documentsUrls: {
    addressProof: string;
    identityDocument: string;
    marriageCertificate?: string;
  };
}

export class CreateRecadastrationService {
  async execute({ userId, organizationId, data, documentsUrls }: CreateRecadastrationRequest) {
    const mainDb = db.getMainDb();

    // Check if organization exists and has RECADASTRATION service active
    const organization = mainDb.prepare(`
      SELECT subdomain, services
      FROM organizations
      WHERE id = ? AND active = 1
    `).get(organizationId) as { subdomain: string; services: string } | undefined;

    if (!organization) {
      throw new AppError('Organização não encontrada');
    }

    const services = JSON.parse(organization.services);
    if (!services.includes('RECADASTRATION')) {
      throw new AppError('Serviço de Recadastramento não disponível');
    }

    const organizationDb = await db.getOrganizationDb(organization.subdomain) as Database.Database;

    // Check if user belongs to organization
    const user = organizationDb.prepare(`
      SELECT id, active
      FROM users
      WHERE id = ?
    `).get(userId) as { id: string; active: number } | undefined;

    if (!user || !user.active) {
      throw new AppError('Usuário não encontrado');
    }

    // Check if there's already a pending recadastration
    const pendingRecadastration = organizationDb.prepare(`
      SELECT 1
      FROM recadastration
      WHERE user_id = ? AND status = 'PENDING'
    `).get(userId);

    if (pendingRecadastration) {
      throw new AppError('Já existe um recadastramento pendente');
    }

    const id = generateId();
    const timestamp = getCurrentTimestamp();

    // Create recadastration record
    organizationDb.prepare(`
      INSERT INTO recadastration (
        id,
        user_id,
        data,
        documents_urls,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      stringifyJSON(data),
      stringifyJSON(documentsUrls),
      timestamp,
      timestamp
    );

    return {
      id,
      userId,
      data,
      documentsUrls,
      status: 'PENDING',
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }
}