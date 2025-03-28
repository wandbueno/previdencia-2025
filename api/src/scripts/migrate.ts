import { db } from '../lib/database';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
  try {
    console.log('Starting migration...');

    // Create data directories if they don't exist
    const dataDir = process.env.NODE_ENV === 'production' 
      ? '/data'  // Caminho no Fly.io
      : path.join(process.cwd(), 'data');  // Caminho local
    
    const organizationsDir = path.join(dataDir, 'organizations');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const backupsDir = path.join(process.cwd(), 'backups');

    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(organizationsDir, { recursive: true });
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(backupsDir, { recursive: true });

    console.log('✓ Data directories created');

    // Initialize main database
    await db.initialize();
    console.log('✓ Main database initialized');

    // Get all organization databases and update their schema
    const mainDb = db.getMainDb();
    const organizations = mainDb.prepare(`
      SELECT subdomain FROM organizations WHERE active = 1
    `).all() as { subdomain: string }[];

    console.log(`Found ${organizations.length} active organizations`);

    // Update schema for each organization database
    for (const org of organizations) {
      const orgDb = db.createOrganizationDb(org.subdomain);

      // Verificar se a coluna cpf_url já existe na tabela proof_of_life
      const cpfUrlExists = orgDb.prepare(`
        SELECT COUNT(*) as count FROM pragma_table_info('proof_of_life') 
        WHERE name='cpf_url'
      `).get() as { count: number };

      if (cpfUrlExists.count === 0) {
        // Adicionar a coluna cpf_url apenas se ela não existir
        console.log(`Adding cpf_url column to proof_of_life table for organization: ${org.subdomain}`);
        
        try {
          // Usar ALTER TABLE para adicionar a nova coluna
          orgDb.exec(`
            ALTER TABLE proof_of_life ADD COLUMN cpf_url TEXT;
          `);
          console.log(`✓ Successfully added cpf_url column for: ${org.subdomain}`);
        } catch (error) {
          console.error(`Error adding cpf_url column for ${org.subdomain}:`, error);
          throw error;
        }
      } else {
        console.log(`✓ cpf_url column already exists for: ${org.subdomain}`);
      }
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();