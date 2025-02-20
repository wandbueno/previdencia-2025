import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { upload } from '../middlewares/upload';
import { UploadController } from '../controllers/upload/uploadController';
import { UploadLogoController } from '../controllers/upload/uploadLogoController';
import { FileSystem } from '../utils/fileSystem';

const uploadRoutes = Router();
const uploadController = new UploadController();
const uploadLogoController = new UploadLogoController();

// Garantir que os diretórios existam
uploadRoutes.use(async (req, res, next) => {
  try {
    if (req.path === '/logo') {
      await FileSystem.ensureLogosDirectory();
    }
    next();
  } catch (error) {
    console.error('Error ensuring upload directory:', error);
    res.status(500).json({ error: 'Error ensuring upload directory' });
  }
});

// Rotas que precisam de autenticação
uploadRoutes.use('/document', ensureAuthenticated);
uploadRoutes.use('/selfie', ensureAuthenticated);

// Rotas que não precisam de autenticação
uploadRoutes.post(
  '/logo',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Error uploading file:', err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  (req, res) => uploadLogoController.uploadLogo(req, res)
);

// Rotas autenticadas
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