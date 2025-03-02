import { Router } from 'express';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';

const debugRouter = Router();

// Endpoint para verificar se um arquivo existe
debugRouter.get('/file-exists', async (req, res) => {
  const { filePath } = req.query;
  
  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Caminho do arquivo é obrigatório' 
    });
  }
  
  try {
    // Determinar o caminho base para uploads
    const baseUploadsPath = process.env.NODE_ENV === 'production'
      ? '/data/uploads'
      : path.join(process.cwd(), 'uploads');
    
    let fullPath = '';
    
    // Verificar se o caminho já inclui o diretório de uploads
    if (filePath.includes('/uploads/') || filePath.includes('\\uploads\\')) {
      // Extrair apenas a parte após "/uploads/"
      const parts = filePath.split(/[\/\\]uploads[\/\\]/);
      if (parts.length > 1) {
        fullPath = path.join(baseUploadsPath, parts[1]);
      } else {
        fullPath = path.join(baseUploadsPath, filePath);
      }
    } else {
      // Se não incluir, assumir que é relativo ao diretório de uploads
      fullPath = path.join(baseUploadsPath, filePath);
    }
    
    // Normalizar o caminho
    fullPath = path.normalize(fullPath);
    
    // Verificar se o arquivo existe
    await fs.access(fullPath, fs.constants.F_OK);
    
    // Obter informações do arquivo
    const stats = await fs.stat(fullPath);
    
    return res.json({
      success: true,
      exists: true,
      filePath: filePath,
      resolvedPath: fullPath,
      size: stats.size,
      isDirectory: stats.isDirectory(),
      created: stats.birthtime,
      modified: stats.mtime
    });
  } catch (error: any) {
    console.error(`Erro ao verificar arquivo ${filePath}:`, error);
    return res.status(404).json({
      success: false,
      exists: false,
      filePath: filePath,
      message: `Arquivo não encontrado ou inacessível: ${error.message}`
    });
  }
});

// Endpoint para listar conteúdo de um diretório
debugRouter.get('/list-directory', async (req, res) => {
  const { directory } = req.query;
  
  if (!directory || typeof directory !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Diretório é obrigatório' 
    });
  }
  
  try {
    // Determinar o caminho base para uploads
    const baseUploadsPath = process.env.NODE_ENV === 'production'
      ? '/data/uploads'
      : path.join(process.cwd(), 'uploads');
    
    // Verificar se o caminho é relativo ou já inclui o diretório base
    let fullPath = '';
    if (directory.startsWith(baseUploadsPath)) {
      fullPath = directory;
    } else {
      // Assumir que é relativo ao diretório de uploads
      fullPath = path.join(baseUploadsPath, directory);
    }
    
    // Normalizar o caminho
    fullPath = path.normalize(fullPath);
    
    // Verificar se o diretório existe
    const stats = await fs.stat(fullPath);
    
    if (!stats.isDirectory()) {
      return res.status(400).json({
        success: false,
        message: 'O caminho especificado não é um diretório'
      });
    }
    
    // Listar conteúdo do diretório
    const files = await fs.readdir(fullPath);
    
    // Obter informações detalhadas de cada arquivo
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(fullPath, file);
        try {
          const fileStats = await fs.stat(filePath);
          return {
            name: file,
            path: filePath,
            relativePath: path.relative(baseUploadsPath, filePath),
            size: fileStats.size,
            isDirectory: fileStats.isDirectory(),
            created: fileStats.birthtime,
            modified: fileStats.mtime
          };
        } catch (error: any) {
          return {
            name: file,
            path: filePath,
            error: error.message
          };
        }
      })
    );
    
    return res.json({
      success: true,
      directory: fullPath,
      baseDirectory: baseUploadsPath,
      files: fileDetails
    });
  } catch (error: any) {
    console.error(`Erro ao listar diretório ${directory}:`, error);
    return res.status(404).json({
      success: false,
      directory: directory,
      message: `Diretório não encontrado ou inacessível: ${error.message}`
    });
  }
});

// Rota para verificar permissões e caminhos
debugRouter.get('/server-info', (req, res) => {
  const uploadsPath = process.env.NODE_ENV === 'production'
    ? '/data/uploads'
    : path.join(process.cwd(), 'uploads');

  const serverInfo = {
    environment: process.env.NODE_ENV || 'development',
    uploadsPath,
    apiUrl: process.env.API_URL || 'Not defined',
    corsOrigin: process.env.CORS_ORIGIN || 'Not defined',
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };

  res.json({
    success: true,
    serverInfo
  });
});

export { debugRouter };
