import path from 'path';
import crypto from 'crypto';
import multer, { StorageEngine } from 'multer';
import { AppError } from '../errors/AppError';
import { FileSystem } from '../utils/fileSystem';

const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

interface IUploadConfig {
  directory: string;
  storage: StorageEngine;
}

export default {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: async (request, file, callback) => {
      try {
        // Se for upload de logo, usar a pasta logos
        if (request.path === '/logo') {
          const logosPath = await FileSystem.ensureLogosDirectory();
          return callback(null, logosPath);
        }

        // Para outros uploads, usar a pasta da organização
        const { organizationId } = request.user;
        if (!organizationId) {
          return callback(new Error('Organization ID not found'), '');
        }

        const organizationPath = await FileSystem.ensureOrganizationDirectory(organizationId);
        callback(null, organizationPath);
      } catch (error) {
        callback(error as Error, '');
      }
    },
    filename: (request, file, callback) => {
      const fileHash = crypto.randomBytes(16).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      callback(null, fileName);
    },
  }),
} as IUploadConfig;