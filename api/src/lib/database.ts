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

  public async initialize(): Promise<void> {
    const mainDb = this.getMainDb();
    this.initializeMainDb(mainDb);
  }

  public getMainDb(): Database.Database {
    // No Fly.io, o volume está montado em /data
    const dataDir = process.env.NODE_ENV === 'production' 
      ? '/data'  // Caminho no Fly.io
      : path.join(process.cwd(), 'data');  // Caminho local
      
    const dbPath = path.join(dataDir, 'main.db');
    this.ensureDirectoryExists(dataDir);
    return new Database(dbPath);
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
        cnpj TEXT NOT NULL,
        state TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        cep TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        logo_url TEXT,
        active INTEGER DEFAULT 1,
        services TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private initializeOrganizationDb(db: Database.Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')),
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')),
        active INTEGER DEFAULT 1,
        can_proof_of_life INTEGER DEFAULT 0,
        can_recadastration INTEGER DEFAULT 0,
        rg TEXT,
        birth_date TEXT,
        address TEXT,
        phone TEXT,
        registration_number TEXT,
        process_number TEXT,
        benefit_start_date TEXT,
        benefit_end_date TEXT,
        benefit_type TEXT CHECK (benefit_type IN ('APOSENTADORIA', 'PENSAO')),
        retirement_type TEXT,
        insured_name TEXT,
        legal_representative TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('PROOF_OF_LIFE', 'RECADASTRATION')),
        title TEXT NOT NULL,
        description TEXT,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS proof_of_life (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')),
        selfie_url TEXT NOT NULL,
        document_front_url TEXT NOT NULL,
        document_back_url TEXT NOT NULL,
        cpf_url TEXT NOT NULL,
        reviewed_at DATETIME,
        reviewed_by TEXT,
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES app_users(id),
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
      );

       CREATE TABLE IF NOT EXISTS proof_of_life_history (
        id TEXT PRIMARY KEY,
        proof_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED')),
        comments TEXT,
        reviewed_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proof_id) REFERENCES proof_of_life(id),
        FOREIGN KEY (user_id) REFERENCES app_users(id),
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
      );

      CREATE TABLE IF NOT EXISTS recadastration (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        data TEXT NOT NULL,
        documents_urls TEXT NOT NULL,
        reviewed_at DATETIME,
        reviewed_by TEXT,
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES app_users(id),
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
      );
    `);
  }

  public getOrganizationDb(subdomain: string): Database.Database {
    const connection = this.connections.get(subdomain);

    if (connection) {
      connection.lastAccess = new Date();
      return connection.db;
    }

    if (this.connections.size >= this.maxConnections) {
      this.cleanOldConnections();
    }

    const dataDir = process.env.NODE_ENV === 'production' 
      ? '/data/organizations'  // Caminho no Fly.io
      : path.join(process.cwd(), 'data', 'organizations');  // Caminho local
    
    const dbPath = path.join(dataDir, `${subdomain}.db`);
    this.ensureDirectoryExists(dataDir);

    if (!fs.existsSync(dbPath)) {
      throw new AppError(`Database not found for organization: ${subdomain}`);
    }

    const db = new Database(dbPath);
    this.initializeOrganizationDb(db);
    
    this.connections.set(subdomain, {
      db,
      lastAccess: new Date()
    });

    return db;
  }

  public createOrganizationDb(subdomain: string): Database.Database {
    const dataDir = process.env.NODE_ENV === 'production' 
      ? '/data/organizations'  // Caminho no Fly.io
      : path.join(process.cwd(), 'data', 'organizations');  // Caminho local
    
    const dbPath = path.join(dataDir, `${subdomain}.db`);
    this.ensureDirectoryExists(dataDir);

    const db = new Database(dbPath);
    this.initializeOrganizationDb(db);
    return db;
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

export const db = DatabaseManager.getInstance();