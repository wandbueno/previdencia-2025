import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { AppError } from '../errors/AppError';

interface DatabaseConnection {
  db: Database.Database;
  lastAccess: Date;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private connections: Map<string, DatabaseConnection>;
  private readonly maxConnections: number;
  private readonly connectionTimeout: number;

  private constructor() {
    this.connections = new Map();
    this.maxConnections = 10;
    this.connectionTimeout = 5 * 60 * 1000; // 5 minutes
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getMainDb(): Database.Database {
    const dbPath = path.join(process.cwd(), 'data', 'main.db');
    this.ensureDirectoryExists(path.dirname(dbPath));

    const db = new Database(dbPath);
    this.initializeMainDb(db);
    return db;
  }

  private initializeMainDb(db: Database.Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS super_admins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subdomain TEXT UNIQUE NOT NULL,
        state TEXT NOT NULL,
        city TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        services TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public async getOrganizationDb(subdomain: string): Promise<Database.Database> {
    const connection = this.connections.get(subdomain);

    if (connection) {
      connection.lastAccess = new Date();
      return connection.db;
    }

    if (this.connections.size >= this.maxConnections) {
      this.cleanOldConnections();
    }

    const dbPath = path.join(process.cwd(), 'data', 'organizations', `${subdomain}.db`);
    this.ensureDirectoryExists(path.dirname(dbPath));

    if (!fs.existsSync(dbPath)) {
      throw new AppError(`Database not found for organization: ${subdomain}`);
    }

    const db = new Database(dbPath);
    this.connections.set(subdomain, {
      db,
      lastAccess: new Date()
    });

    return db;
  }

  public createOrganizationDb(subdomain: string): Database.Database {
    const dbPath = path.join(process.cwd(), 'data', 'organizations', `${subdomain}.db`);
    this.ensureDirectoryExists(path.dirname(dbPath));

    const db = new Database(dbPath);
    this.initializeOrganizationDb(db);
    return db;
  }

  private initializeOrganizationDb(db: Database.Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS proof_of_life (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        selfie_url TEXT NOT NULL,
        document_url TEXT NOT NULL,
        reviewed_at DATETIME,
        reviewed_by TEXT,
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS recadastration (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        data TEXT NOT NULL,
        documents_urls TEXT NOT NULL,
        reviewed_at DATETIME,
        reviewed_by TEXT,
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  }

  private cleanOldConnections(): void {
    const now = new Date().getTime();
    
    for (const [subdomain, connection] of this.connections.entries()) {
      if (now - connection.lastAccess.getTime() > this.connectionTimeout) {
        connection.db.close();
        this.connections.delete(subdomain);
      }
    }
  }

  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  public async disconnect(subdomain: string): Promise<void> {
    const connection = this.connections.get(subdomain);
    if (connection) {
      connection.db.close();
      this.connections.delete(subdomain);
    }
  }

  public async disconnectAll(): Promise<void> {
    for (const [subdomain, connection] of this.connections.entries()) {
      connection.db.close();
      this.connections.delete(subdomain);
    }
  }
}

export const databaseManager = DatabaseManager.getInstance();