import { Request, Response } from 'express';
import { AppError } from '../../errors/AppError';
import { UploadService } from '../../services/upload/uploadService';

export class UploadController {
  async uploadDocument(request: Request, response: Response) {
    const file = request.file;
    const { id: userId, organizationId } = request.user;

    if (!file) {
      throw new AppError('No file provided');
    }

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    const uploadService = new UploadService();
    const result = await uploadService.execute({
      file,
      organizationId,
      userId,
      type: 'document'
    });

    return response.json({
      success: true,
      file: result
    });
  }

  async uploadSelfie(request: Request, response: Response) {
    const file = request.file;
    const { id: userId, organizationId } = request.user;

    if (!file) {
      throw new AppError('No file provided');
    }

    if (!userId || !organizationId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new AppError('File must be an image');
    }

    const uploadService = new UploadService();
    const result = await uploadService.execute({
      file,
      organizationId,
      userId,
      type: 'selfie'
    });

    return response.json({
      success: true,
      file: result
    });
  }
}