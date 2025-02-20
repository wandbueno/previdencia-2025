import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp } from '../../utils/database';
import { Organization, OrganizationRow, UpdateOrganizationDTO } from '../../types/organization';

export class UpdateOrganizationService {
  async execute(id: string, data: UpdateOrganizationDTO): Promise<Organization> {
    try {
      const mainDb = db.getMainDb();

      // Verificar se a organização existe
      const organization = mainDb.prepare(`
        SELECT * FROM organizations WHERE id = ?
      `).get(id) as OrganizationRow | undefined;

      if (!organization) {
        throw new AppError('Organização não encontrada', 404);
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      // Adicionar campos que foram fornecidos para atualização
      if (data.name) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.cnpj) {
        updateFields.push('cnpj = ?');
        updateValues.push(data.cnpj);
      }
      if (data.state) {
        updateFields.push('state = ?');
        updateValues.push(data.state);
      }
      if (data.city) {
        updateFields.push('city = ?');
        updateValues.push(data.city);
      }
      if (data.address) {
        updateFields.push('address = ?');
        updateValues.push(data.address);
      }
      if (data.cep) {
        updateFields.push('cep = ?');
        updateValues.push(data.cep);
      }
      if (data.phone) {
        updateFields.push('phone = ?');
        updateValues.push(data.phone);
      }
      if (data.email) {
        updateFields.push('email = ?');
        updateValues.push(data.email);
      }
      if (data.logo_url !== undefined) {
        updateFields.push('logo_url = ?');
        updateValues.push(data.logo_url === null ? null : data.logo_url);
      }
      if (data.services) {
        updateFields.push('services = ?');
        updateValues.push(JSON.stringify(data.services));
      }
      if (data.active !== undefined) {
        updateFields.push('active = ?');
        updateValues.push(data.active ? 1 : 0);
      }

      // Adicionar updated_at
      updateFields.push('updated_at = ?');
      updateValues.push(getCurrentTimestamp());

      // Adicionar id para a cláusula WHERE
      updateValues.push(id);

      // Atualizar organização
      if (updateFields.length > 0) {
        mainDb.prepare(`
          UPDATE organizations
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `).run(...updateValues);
      }

      // Retornar organização atualizada
      const updatedOrganization = mainDb.prepare(`
        SELECT * FROM organizations WHERE id = ?
      `).get(id) as OrganizationRow;

      if (!updatedOrganization) {
        throw new AppError('Erro ao atualizar organização: registro não encontrado');
      }

      return {
        id: updatedOrganization.id,
        name: updatedOrganization.name,
        subdomain: updatedOrganization.subdomain,
        cnpj: updatedOrganization.cnpj,
        state: updatedOrganization.state,
        city: updatedOrganization.city,
        address: updatedOrganization.address,
        cep: updatedOrganization.cep,
        phone: updatedOrganization.phone,
        email: updatedOrganization.email,
        logo_url: updatedOrganization.logo_url === null ? null : updatedOrganization.logo_url,
        active: Boolean(updatedOrganization.active),
        services: JSON.parse(updatedOrganization.services),
        created_at: updatedOrganization.created_at,
        updated_at: updatedOrganization.updated_at
      };
    } catch (error) {
      console.error('Error in UpdateOrganizationService:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error updating organization');
    }
  }
}