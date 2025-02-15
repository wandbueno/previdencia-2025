import { Request, Response } from 'express';
import { FileSystem } from '../../utils/fileSystem';

export class UploadLogoController {
  async uploadLogo(request: Request, response: Response): Promise<Response> {
    try {
      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: 'No file uploaded' });
      }

      // Garantir que o diretório existe
      await FileSystem.ensureLogosDirectory();

      // Retornar o caminho relativo normalizado
      const relativePath = FileSystem.normalizePath(`/logos/${file.filename}`);
      console.log('Logo path:', relativePath);
      
      return response.json({ path: relativePath });
    } catch (error) {
      console.error('Error in UploadLogoController:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}
