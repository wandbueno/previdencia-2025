import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import uploadConfig from '../config/upload';

const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);
const unlinkAsync = promisify(fs.unlink);

export const FileSystem = {
  async ensureOrganizationDirectory(organizationId: string): Promise<string> {
    const organizationPath = path.join(uploadConfig.directory, organizationId);
    
    if (!(await existsAsync(organizationPath))) {
      await mkdirAsync(organizationPath, { recursive: true });
    }
    
    return organizationPath;
  },

  async deleteFile(filePath: string): Promise<void> {
    try {
      await unlinkAsync(filePath);
    } catch {
      // Ignore error if file doesn't exist
    }
  },

  getFilePath(organizationId: string, filename: string): string {
    return path.join(uploadConfig.directory, organizationId, filename);
  },

  // Convert Windows path to POSIX style for storage
  normalizePath(filePath: string): string {
    return filePath.split(path.sep).join('/');
  }
};