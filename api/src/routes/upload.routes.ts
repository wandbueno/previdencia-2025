import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { upload, ensureUploadDirectory } from '../middlewares/upload';
import { UploadController } from '../controllers/upload/uploadController';

const uploadRoutes = Router();
const uploadController = new UploadController();

uploadRoutes.use(ensureAuthenticated);
uploadRoutes.use(ensureUploadDirectory);

uploadRoutes.post(
  '/document',
  upload.single('file'),
  uploadController.uploadDocument
);

uploadRoutes.post(
  '/selfie',
  upload.single('file'),
  uploadController.uploadSelfie
);

export { uploadRoutes };