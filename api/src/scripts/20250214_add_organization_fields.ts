import { db } from '../lib/database';

async function migrate() {
  try {
    console.log('Starting migration: Add organization fields');
    const mainDb = db.getMainDb();

    // Iniciar transação
    mainDb.exec('BEGIN TRANSACTION');

    try {
      // 1. Renomear a tabela atual para backup
      mainDb.exec('ALTER TABLE organizations RENAME TO organizations_old');

      // 2. Criar nova tabela com todos os campos
      mainDb.exec(`
        CREATE TABLE organizations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          subdomain TEXT UNIQUE NOT NULL,
          cnpj TEXT,
          state TEXT NOT NULL,
          city TEXT NOT NULL,
          address TEXT,
          cep TEXT,
          phone TEXT,
          email TEXT,
          logo_url TEXT,
          active INTEGER DEFAULT 1,
          services TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 3. Copiar dados da tabela antiga para a nova
      mainDb.exec(`
        INSERT INTO organizations (
          id, name, subdomain, state, city, active, services, created_at, updated_at
        )
        SELECT 
          id, name, subdomain, state, city, active, services, created_at, updated_at
        FROM organizations_old
      `);

      // 4. Dropar a tabela antiga
      mainDb.exec('DROP TABLE organizations_old');

      // Commit transação
      mainDb.exec('COMMIT');
      console.log('Migration completed successfully');
    } catch (error) {
      // Rollback em caso de erro
      mainDb.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Executar migração
migrate();
