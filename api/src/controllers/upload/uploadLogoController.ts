import { Request, Response } from 'express';
import { FileSystem } from '../../utils/fileSystem';
import { UpdateOrganizationLogoService } from '../../services/organization/updateOrganizationLogoService';

export class UploadLogoController {
  async uploadLogo(request: Request, response: Response): Promise<Response> {
    try {
      const file = request.file;
      const { organizationId } = request.body;

      if (!file) {
        return response.status(400).json({ error: 'No file uploaded' });
      }

      if (!organizationId) {
        return response.status(400).json({ error: 'Organization ID is required' });
      }

      // Garantir que o diretório existe
      await FileSystem.ensureLogosDirectory();

      // Retornar o caminho relativo normalizado
      const relativePath = FileSystem.normalizePath(`/logos/${file.filename}`);
      console.log('Logo path:', relativePath);
      
      // Atualizar a logo da organização usando o serviço
      const updateOrganizationLogoService = new UpdateOrganizationLogoService();
      const organization = await updateOrganizationLogoService.execute({
        organizationId,
        logoUrl: relativePath
      });
      
      return response.json(organization);
    } catch (error) {
      console.error('Error in UploadLogoController:', error);
      if (error instanceof Error) {
        return response.status(400).json({ error: error.message });
      }
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}
