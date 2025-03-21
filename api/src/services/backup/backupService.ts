import path from 'path';
import fs from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { serverConfig } from '../../config/server';

// Interface para organizações retornadas do banco de dados
interface Organization {
  id: string;
  subdomain: string;
}

// Interface para backups criados
interface BackupFile {
  name: string;
  path: string;
  size: number;
}

// Interface para a resposta de criação de backup
export interface BackupCreationResponse {
  success: boolean;
  message: string;
  filename: string;
  backups: number;
  path: string;
  downloadUrl: string;
}

// Função auxiliar para verificar se um erro tem propriedade code
function isNodeError(error: unknown): error is NodeError {
  return error instanceof Error && 'code' in error;
}

// Interface para erros com código - comum em Node.js
interface NodeError extends Error {
  code?: string;
}

// Verificação da existência do módulo archiver
let archiver: any = null;
try {
  archiver = require('archiver');
  console.log('📦 Módulo archiver carregado com sucesso');
} catch (error: unknown) {
  console.error('❌ Erro ao carregar o módulo archiver:', error);
}

export class BackupService {
  // Método para criar backup
  async createBackup(isSuperAdmin: boolean): Promise<BackupCreationResponse> {
    if (typeof isSuperAdmin !== 'boolean') {
      throw new AppError('Parâmetro isSuperAdmin deve ser um boolean', 400);
    }

    if (!isSuperAdmin) {
      throw new AppError('Acesso não autorizado', 403);
    }

    // Verificar se o módulo archiver está disponível
    if (!archiver) {
      console.error('❌ Módulo archiver não está disponível. Necessário para criar arquivos ZIP.');
      throw new AppError('Módulo necessário para backup não está disponível no servidor', 500);
    }

    // Criar diretório de backup se não existir
    const backupDir = path.resolve(process.cwd(), 'backups');
    console.log(`🗂️ Diretório de backup: ${backupDir}`);
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      console.log('👍 Diretório de backup criado/verificado com sucesso');
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'EEXIST') {
        console.log('👀 Diretório de backup já existe');
      } else {
        console.error('🚨 Erro ao criar diretório de backup:', error);
        throw new AppError(`Erro ao criar diretório de backup: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:-]/g, '')
      .replace('T', '_')
      .split('.')[0];
    
    // Array para armazenar informações dos backups criados
    const backupsCreated: BackupFile[] = [];
    
    // Backup do banco principal
    try {
      // Caminho para o backup do banco principal
      const mainDbBackupPath = path.join(backupDir, `main_${timestamp}.db`);
      console.log(`📁 Caminho do backup do banco principal: ${mainDbBackupPath}`);
      
      // Obter conexão com o banco principal
      const mainDb = db.getMainDb();
      
      // Criar backup
      console.log('💻 Criando backup do banco principal...');
      mainDb.exec(`VACUUM INTO '${mainDbBackupPath}'`);
      const stats = await fs.stat(mainDbBackupPath);
      backupsCreated.push({ 
        name: `main_${timestamp}.db`, 
        path: mainDbBackupPath,
        size: stats.size
      });
      console.log(`👍 Backup do banco principal criado: ${stats.size} bytes`);
    } catch (error: unknown) {
      console.error('🚨 Erro ao criar backup do banco principal:', error);
      throw new AppError(`Erro ao criar backup do banco principal: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Obter todas as organizações ativas
    const orgs = db.getMainDb().prepare('SELECT id, subdomain FROM organizations WHERE active = 1').all() as Organization[];
    console.log(`👥 Organizações a serem incluídas no backup: ${orgs.length}`);
    
    // Criar backups de cada organização
    for (const org of orgs) {
      try {
        // Caminho para o backup da organização
        const orgDbBackupPath = path.join(backupDir, `org_${org.subdomain}_${timestamp}.db`);
        console.log(`📁 Caminho do backup da organização ${org.subdomain}: ${orgDbBackupPath}`);
        
        // Obter conexão com o banco da organização
        const orgDb = db.getOrganizationDb(org.subdomain);
        
        // Criar backup
        console.log(`💻 Criando backup da organização ${org.subdomain}...`);
        orgDb.exec(`VACUUM INTO '${orgDbBackupPath}'`);
        const stats = await fs.stat(orgDbBackupPath);
        backupsCreated.push({ 
          name: `org_${org.subdomain}_${timestamp}.db`, 
          path: orgDbBackupPath,
          size: stats.size
        });
        console.log(`👍 Backup da organização ${org.subdomain} criado: ${stats.size} bytes`);
      } catch (error: unknown) {
        console.error(`🚨 Erro ao criar backup da organização ${org.subdomain}:`, error);
        console.error(`🤔 Ignorando erro e continuando com as próximas organizações`);
      }
    }

    // Backup da pasta uploads
    try {
      // Determinar o caminho da pasta uploads
      const uploadsDir = process.env.NODE_ENV === 'production' 
        ? '/data/uploads'  // Caminho no Fly.io
        : path.join(process.cwd(), 'uploads');  // Caminho local

      // Verificar se a pasta existe
      if (existsSync(uploadsDir)) {
        console.log(`📁 Iniciando backup da pasta uploads: ${uploadsDir}`);
        
        // Criar um arquivo zip separado para os uploads
        const uploadsBackupPath = path.join(backupDir, `uploads_${timestamp}.zip`);
        const uploadsArchive = archiver('zip', {
          zlib: { level: 9 } // Nível máximo de compressão
        });
        
        const uploadsOutput = createWriteStream(uploadsBackupPath);
        
        uploadsArchive.pipe(uploadsOutput);
        
        // Adicionar todo o conteúdo da pasta uploads
        uploadsArchive.directory(uploadsDir, 'uploads');
        
        await new Promise((resolve, reject) => {
          uploadsOutput.on('close', resolve);
          uploadsArchive.on('error', reject);
          uploadsArchive.finalize();
        });

        const stats = await fs.stat(uploadsBackupPath);
        backupsCreated.push({
          name: `uploads_${timestamp}.zip`,
          path: uploadsBackupPath,
          size: stats.size
        });
        console.log(`👍 Backup da pasta uploads criado: ${stats.size} bytes`);
      } else {
        console.log('⚠️ Pasta uploads não encontrada, continuando sem backup de arquivos');
      }
    } catch (error: unknown) {
      console.error('🚨 Erro ao criar backup da pasta uploads:', error);
      // Não interromper o processo se falhar o backup dos uploads
    }

    // Se não houver backups, retornar erro
    if (backupsCreated.length === 0) {
      throw new AppError('Nenhum backup foi criado');
    }

    // Criar um arquivo ZIP com todos os backups
    console.log('📦 Criando arquivo ZIP com todos os backups...');
    
    const zipFilename = `backup_${timestamp}.zip`;
    const zipFilePath = path.join(backupDir, zipFilename);
    
    try {
      await this.createZipArchive(backupsCreated.map(b => b.path), zipFilePath);
      
      // Verificar o tamanho do arquivo ZIP
      const zipStats = await fs.stat(zipFilePath);
      console.log(`📊 Tamanho do arquivo ZIP: ${zipStats.size} bytes`);
    } catch (error: unknown) {
      console.error('🚨 Erro ao criar arquivo ZIP:', error);
      throw new AppError(`Erro ao criar arquivo ZIP: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Registrar o backup no log
    const backupLogPath = path.join(backupDir, 'backup_log.txt');
    const logEntry = `${timestamp} | ${zipFilename} | ${backupsCreated.length} arquivos | ${backupsCreated.map(b => b.name).join(', ')}\n`;
    
    try {
      await fs.appendFile(backupLogPath, logEntry);
    } catch (error: unknown) {
      console.warn('🤔 Erro ao registrar backup no log:', error);
      // Não falhar o processo se não conseguir registrar no log
    }
    
    // Retornar caminho do arquivo ZIP para download
    const response: BackupCreationResponse = {
      success: true,
      message: 'Backup criado com sucesso',
      filename: zipFilename,
      backups: backupsCreated.length,
      path: zipFilePath,
      downloadUrl: serverConfig.getStaticUrl('backups', zipFilename)
    };
    
    console.log('📤 Retornando resposta com detalhes do backup criado:', response);
    return response;
  }

  // Método para criar arquivo ZIP
  private createZipArchive(filePaths: string[], outputPath: string): Promise<void> {
    console.log(`📦 Criando arquivo ZIP com ${filePaths.length} arquivos`);
    console.log(`📁 Arquivos a serem incluídos no ZIP:`, filePaths);
    
    return new Promise((resolve, reject) => {
      if (!archiver) {
        console.error('❌ Módulo archiver não está disponível');
        return reject(new Error("Módulo archiver não está disponível"));
      }

      const output = createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Nível de compressão máximo
      });

      output.on('close', () => {
        console.log(`📦 Arquivo ZIP criado: ${outputPath} - ${archive.pointer()} bytes`);
        resolve();
      });

      output.on('error', (err: Error) => {
        console.error('🚨 Erro no stream de saída do ZIP:', err);
        reject(err);
      });

      archive.on('error', (err: Error) => {
        console.error('🚨 Erro no archive do ZIP:', err);
        reject(err);
      });

      archive.on('warning', (err: Error) => {
        if (isNodeError(err) && err.code === 'ENOENT') {
          console.warn('🤔 Aviso ao criar ZIP:', err);
        } else {
          reject(err);
        }
      });

      // Pipe do archive para o output
      archive.pipe(output);

      // Adicionar cada arquivo ao ZIP
      filePaths.forEach(filePath => {
        try {
          if (existsSync(filePath)) {
            const filename = path.basename(filePath);
            console.log(`📎 Adicionando arquivo ao ZIP: ${filename}`);
            archive.file(filePath, { name: filename });
          } else {
            console.warn(`⚠️ Arquivo não encontrado, ignorando: ${filePath}`);
          }
        } catch (error: unknown) {
          console.warn(`⚠️ Erro ao adicionar arquivo ao ZIP: ${filePath}`, error);
        }
      });

      // Finalizar o archive
      archive.finalize();
    });
  }

  // Listar backups disponíveis
  async listBackups(isSuperAdmin: boolean) {
    if (typeof isSuperAdmin !== 'boolean') {
      throw new AppError('Parâmetro isSuperAdmin deve ser um boolean', 400);
    }

    if (!isSuperAdmin) {
      throw new AppError('Acesso não autorizado', 403);
    }

    const backupDir = path.resolve(process.cwd(), 'backups');
    
    try {
      await fs.access(backupDir);
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        await fs.mkdir(backupDir, { recursive: true });
        return { backups: [] };
      } else {
        throw new AppError(`Erro ao acessar diretório de backups: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    try {
      const files = await fs.readdir(backupDir);
      const zipFiles = files.filter(file => file.endsWith('.zip'));
      
      const backups = await Promise.all(zipFiles.map(async (file) => {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          downloadUrl: serverConfig.getStaticUrl('backups', file)
        };
      }));
      
      // Ordenar por data de criação, mais recente primeiro
      backups.sort((a, b) => b.created.getTime() - a.created.getTime());
      
      return { backups };
    } catch (error: unknown) {
      throw new AppError(`Erro ao listar backups: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Excluir um backup
  async deleteBackup(isSuperAdmin: boolean, filename: string) {
    if (typeof isSuperAdmin !== 'boolean') {
      throw new AppError('Parâmetro isSuperAdmin deve ser um boolean', 400);
    }

    if (!isSuperAdmin) {
      throw new AppError('Acesso não autorizado', 403);
    }

    // Validar nome do arquivo para segurança
    if (!filename || filename.includes('..') || filename.includes('/')) {
      throw new AppError('Nome de arquivo inválido', 400);
    }

    const backupDir = path.resolve(process.cwd(), 'backups');
    const filePath = path.join(backupDir, filename);
    
    try {
      await fs.access(filePath);
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        throw new AppError('Arquivo de backup não encontrado', 404);
      } else {
        throw new AppError(`Erro ao acessar arquivo de backup: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    try {
      await fs.unlink(filePath);
      return { success: true, message: 'Backup excluído com sucesso' };
    } catch (error: unknown) {
      throw new AppError(`Erro ao excluir backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}