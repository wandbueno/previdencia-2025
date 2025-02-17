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
    try {
      // Para logos, aceitar apenas imagens
      if (request.path === '/logo') {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp'  // Adicionando suporte a WebP
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Logo must be JPG, PNG or WebP'));
        }
        return;
      }

      // Para outros uploads, aceitar PDF também
      const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
      ];

      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Invalid file type'));
      }
    } catch (error) {
      console.error('Error in file filter:', error);
      callback(error as Error);
    }
  },
});

export async function ensureUploadDirectory(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Se for upload de logo, garantir que a pasta logos existe
    if (request.path === '/logo') {
      await FileSystem.ensureLogosDirectory();
    }
    // Se for outro tipo de upload, garantir que a pasta da organização existe
    else if (request.user?.organizationId) {
      await FileSystem.ensureOrganizationDirectory(request.user.organizationId);
    }

    next();
  } catch (error) {
    console.error('Error ensuring upload directory:', error);
    throw new AppError('Error ensuring upload directory');
  }
}