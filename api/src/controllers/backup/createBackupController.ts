import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { AppError } from '../../errors/AppError';
import { BackupService } from '../../services/backup/backupService';

// Interface para erros com código - comum em Node.js
interface NodeError extends Error {
  code?: string;
}

// Função auxiliar para verificar se um erro tem propriedade code
function isNodeError(error: unknown): error is NodeError {
  return error instanceof Error && 'code' in error;
}

export class CreateBackupController {
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  async handle(request: Request, response: Response) {
    try {
      console.log('📋 Iniciando processo de backup via controller...');
      const { isSuperAdmin = false } = request.user;

      const result = await this.backupService.createBackup(!!isSuperAdmin);
      
      return response.json(result);
    } catch (error: unknown) {
      console.error('🚨 Erro ao criar backup:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(`Erro ao criar backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async listBackups(request: Request, response: Response) {
    try {
      console.log('📋 Listando backups disponíveis...');
      const { isSuperAdmin = false } = request.user;

      const result = await this.backupService.listBackups(!!isSuperAdmin);
      
      return response.json(result);
    } catch (error: unknown) {
      console.error('🚨 Erro ao listar backups:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(`Erro ao listar backups: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async downloadBackup(request: Request, response: Response) {
    try {
      const { isSuperAdmin = false } = request.user;
      const { filename } = request.params;
      
      console.log(`📥 Solicitação de download do arquivo: ${filename}`);
      console.log(`👤 Usuário superadmin: ${isSuperAdmin}`);
      console.log(`🔑 Verificando autenticação - Headers:`, JSON.stringify(request.headers, null, 2));

      if (!isSuperAdmin) {
        console.log(`🚫 Acesso negado: usuário não é superadmin`);
        throw new AppError('Acesso não autorizado', 403);
      }

      // Validar nome do arquivo para segurança
      if (!filename || filename.includes('..') || filename.includes('/')) {
        console.log(`🚫 Nome de arquivo inválido: ${filename}`);
        throw new AppError('Nome de arquivo inválido', 400);
      }

      const backupDir = path.resolve(process.cwd(), 'backups');
      const filePath = path.join(backupDir, filename);
      
      console.log(`📁 Caminho completo do arquivo para download: ${filePath}`);

      // Verificar se o arquivo existe
      try {
        const fileStats = await fs.stat(filePath);
        console.log(`✅ Arquivo encontrado:`, {
          path: filePath,
          size: fileStats.size,
          created: fileStats.ctime,
          modified: fileStats.mtime
        });
      } catch (error: unknown) {
        if (isNodeError(error) && error.code === 'ENOENT') {
          console.log(`❌ Arquivo não encontrado: ${filePath}`);
          throw new AppError('Arquivo de backup não encontrado', 404);
        } else {
          console.log(`❌ Erro ao acessar arquivo: ${error instanceof Error ? error.message : String(error)}`);
          throw new AppError(`Erro ao acessar arquivo de backup: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Configuração de cabeçalhos para melhorar a experiência de download
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.setHeader('Content-Type', 'application/zip');
      response.setHeader('Cache-Control', 'no-cache');
      
      // Enviar o arquivo como download
      console.log(`📤 Enviando arquivo ${filePath} para download`);
      return response.download(filePath, filename, (err) => {
        if (err) {
          console.error(`🚨 Erro durante o download: ${err}`);
        } else {
          console.log(`✅ Download concluído com sucesso: ${filename}`);
        }
      });
    } catch (error: unknown) {
      console.error('🚨 Erro ao baixar backup:', error);
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      return response.status(500).json({
        status: 'error',
        message: `Erro ao baixar backup: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  async deleteBackup(request: Request, response: Response) {
    try {
      console.log('🗑️ Iniciando exclusão de backup...');
      const { isSuperAdmin = false } = request.user;
      const { filename } = request.params;

      const result = await this.backupService.deleteBackup(!!isSuperAdmin, filename);
      
      return response.json(result);
    } catch (error: unknown) {
      console.error('🚨 Erro ao excluir backup:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(`Erro ao excluir backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
