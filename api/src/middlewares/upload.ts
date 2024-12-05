import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import uploadConfig from '../config/upload';
import { FileSystem } from '../utils/fileSystem';

export const upload = multer({
  storage: uploadConfig.storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (request, file, callback) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type'));
    }
  },
});

export async function ensureUploadDirectory(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { organizationId } = request.user;

  if (!organizationId) {
    throw new AppError('Organization ID not found', 401);
  }

  await FileSystem.ensureOrganizationDirectory(organizationId);
  
  return next();
}