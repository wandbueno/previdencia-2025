import path from 'path';
import crypto from 'crypto';
import multer, { StorageEngine } from 'multer';
import { AppError } from '../errors/AppError';

const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

interface IUploadConfig {
  directory: string;
  storage: StorageEngine;
}

export default {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: (request, file, callback) => {
      const { organizationId } = request.user;
      
      if (!organizationId) {
        return callback(new Error('Organization ID not found'), '');
      }

      const organizationPath = path.join(uploadFolder, organizationId);
      callback(null, organizationPath);
    },
    filename: (request, file, callback) => {
      const fileHash = crypto.randomBytes(16).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      callback(null, fileName);
    },
  }),
} as IUploadConfig;