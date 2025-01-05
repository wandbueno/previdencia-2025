import fs from 'fs/promises';
import path from 'path';
import { AppError } from '../../errors/AppError';
import { FileSystem } from '../../utils/fileSystem';

interface UploadFileParams {
  file: Express.Multer.File;
  organizationId: string;
  userId: string;
  type: 'document' | 'selfie';
}

export class UploadService {
  async execute({ file, organizationId, userId, type }: UploadFileParams) {
    try {
      // Create organization directory if it doesn't exist
      const organizationPath = await FileSystem.ensureOrganizationDirectory(organizationId);
      
      // Create user directory inside organization directory
      const userPath = path.join(organizationPath, userId);
      await fs.mkdir(userPath, { recursive: true });

      // Generate unique filename
      const timestamp = new Date().getTime();
      const filename = `${type}_${timestamp}_${path.basename(file.originalname)}`;
      const filePath = path.join(userPath, filename);

      // Move file to final destination
      await fs.rename(file.path, filePath);

      // Return normalized path relative to uploads directory
      const relativePath = path.relative(path.join(process.cwd(), 'uploads'), filePath);
      const normalizedPath = FileSystem.normalizePath(relativePath);

      return {
        path: normalizedPath,
        filename,
        mimetype: file.mimetype
      };
    } catch (error) {
      // Clean up temporary file if it exists
      if (file.path) {
        await FileSystem.deleteFile(file.path);
      }

      console.error('Error uploading file:', error);
      throw new AppError('Error uploading file');
    }
  }
}