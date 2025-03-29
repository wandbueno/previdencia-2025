import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { generateId, getCurrentTimestamp } from '../../utils/database';
import { CreateOrganizationDTO, Organization, OrganizationRow } from '../../types/organization';

export class CreateOrganizationService {
  async execute(data: CreateOrganizationDTO): Promise<Organization> {
    try {
      console.log('Creating organization with data:', data);
      const mainDb = db.getMainDb();

      // Verificar se já existe uma organização com o mesmo subdomínio
      const existingOrg = mainDb.prepare(`
        SELECT 1 FROM organizations WHERE subdomain = ?
      `).get(data.subdomain);

      if (existingOrg) {
        throw new AppError('Subdomínio já está em uso');
      }

      const id = generateId();
      const timestamp = getCurrentTimestamp();

      console.log('Generated ID:', id);
      console.log('Generated timestamp:', timestamp);

      // Inserir organização
      mainDb.prepare(`
        INSERT INTO organizations (
          id,
          name,
          subdomain,
          cnpj,
          state,
          city,
          address,
          cep,
          phone,
          email,
          logo_url,
          services,
          active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.name,
        data.subdomain,
        data.cnpj,
        data.state,
        data.city,
        data.address,
        data.cep,
        data.phone,
        data.email,
        data.logo_url === null ? null : data.logo_url,
        JSON.stringify(data.services),
        data.active ? 1 : 0,
        timestamp,
        timestamp
      );

      console.log('Organization inserted into database');

      // Criar banco de dados da organização
      console.log(`\n\n[ORGANIZAÇÃO] ========= INÍCIO DA CRIAÇÃO DA ORGANIZAÇÃO ${data.name} (${data.subdomain}) =========`);
      const organizationDb = db.createOrganizationDb(data.subdomain);

      console.log(`[ORGANIZAÇÃO] Banco de dados sendo criado para ${data.subdomain}`);
      console.log(`[ORGANIZAÇÃO] NODE_ENV atual: ${process.env.NODE_ENV}`);

      // Adicionando verificação após a criação do banco
      try {
        const fs = require('fs');
        const path = require('path');
        
        // Determinar o caminho correto com base no ambiente
        const dataDir = process.env.NODE_ENV === 'production' 
          ? '/data/organizations'  // Caminho no Fly.io
          : path.join(process.cwd(), 'data', 'organizations');  // Caminho local
        
        const dbPath = path.join(dataDir, `${data.subdomain}.db`);
        console.log(`[ORGANIZAÇÃO] Verificando se o banco foi criado em: ${dbPath}`);
        
        if (fs.existsSync(dbPath)) {
          const stats = fs.statSync(dbPath);
          console.log(`[ORGANIZAÇÃO] ✅ SUCESSO! Banco criado com ${stats.size} bytes`);
        } else {
          console.error(`[ORGANIZAÇÃO] ❌ ERRO! Banco NÃO encontrado em: ${dbPath}`);
          // Tentar criar novamente de forma explícita
          console.log(`[ORGANIZAÇÃO] Tentando criar diretório e banco novamente...`);
          fs.mkdirSync(dataDir, { recursive: true });
          db.createOrganizationDb(data.subdomain);
          
          // Verificar novamente
          if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            console.log(`[ORGANIZAÇÃO] ✅ SUCESSO na segunda tentativa! Banco criado com ${stats.size} bytes`);
          } else {
            console.error(`[ORGANIZAÇÃO] ❌ FALHA NA SEGUNDA TENTATIVA! Banco ainda não encontrado.`);
          }
        }
        console.log(`[ORGANIZAÇÃO] ========= FIM DA CRIAÇÃO DA ORGANIZAÇÃO =========\n\n`);
      } catch (error) {
        console.error(`[ORGANIZAÇÃO] Erro ao verificar a criação do banco: ${error}`);
      }

      // Retornar organização criada
      const organization = mainDb.prepare(`
        SELECT * FROM organizations WHERE id = ?
      `).get(id) as OrganizationRow;

      console.log('Retrieved organization:', organization);

      return {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        cnpj: organization.cnpj,
        state: organization.state,
        city: organization.city,
        address: organization.address,
        cep: organization.cep,
        phone: organization.phone,
        email: organization.email,
        logo_url: organization.logo_url === null ? null : organization.logo_url,
        active: Boolean(organization.active),
        services: JSON.parse(organization.services),
        created_at: organization.created_at,
        updated_at: organization.updated_at
      };
    } catch (error) {
      console.error('Error in CreateOrganizationService:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error creating organization');
    }
  }
}