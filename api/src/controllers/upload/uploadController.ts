import { Request, Response } from 'express';
import { AppError } from '../../errors/AppError';

export class UploadController {
  async uploadDocument(request: Request, response: Response) {
    const file = request.file;

    if (!file) {
      throw new AppError('No file provided');
    }

    return response.json({
      success: true,
      file: {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
      }
    });
  }

  async uploadSelfie(request: Request, response: Response) {
    const file = request.file;

    if (!file) {
      throw new AppError('No file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new AppError('File must be an image');
    }

    return response.json({
      success: true,
      file: {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
      }
    });
  }
}