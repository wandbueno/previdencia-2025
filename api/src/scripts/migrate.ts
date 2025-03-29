import { db } from '../lib/database';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('Starting migration...');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Running as deployment migration:', !!process.env.FLY_APP_NAME);

    // Create data directories if they don't exist
    const dataDir = isProduction
      ? '/data'  // Caminho no Fly.io
      : path.join(process.cwd(), 'data');  // Caminho local
    
    const organizationsDir = path.join(dataDir, 'organizations');
    const uploadsDir = isProduction
      ? path.join(dataDir, 'uploads')  // Em produção, uploads ficam em /data/uploads
      : path.join(process.cwd(), 'uploads');  // Em dev, uploads ficam na raiz
    const backupsDir = isProduction
      ? path.join(dataDir, 'backups')  // Em produção, backups ficam em /data/backups
      : path.join(process.cwd(), 'backups');  // Em dev, backups ficam na raiz

    // Criar diretórios necessários
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(organizationsDir, { recursive: true });
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(backupsDir, { recursive: true });

    console.log('✓ Data directories created');
    console.log(`  - Data: ${dataDir}`);
    console.log(`  - Organizations: ${organizationsDir}`);
    console.log(`  - Uploads: ${uploadsDir}`);
    console.log(`  - Backups: ${backupsDir}`);

    // Initialize main database
    await db.initialize();
    console.log('✓ Main database initialized');

    // Listar todos os arquivos de banco de dados de organizações em produção
    let organizationFiles: string[] = [];
    try {
      organizationFiles = await fs.readdir(organizationsDir);
      organizationFiles = organizationFiles.filter(file => file.endsWith('.db'));
      console.log(`Found ${organizationFiles.length} organization database files in ${organizationsDir}`);
    } catch (error) {
      console.error('Error reading organization directory:', error);
      organizationFiles = [];
    }

    // Get all organization databases and update their schema
    const mainDb = db.getMainDb();
    const organizations = mainDb.prepare(`
      SELECT id, name, subdomain, active FROM organizations WHERE active = 1
    `).all() as { id: string; name: string; subdomain: string; active: number }[];

    console.log(`Found ${organizations.length} active organizations in ${isProduction ? 'production' : 'development'}`);

    // Verificar se há organizações que não estão no banco de dados principal
    for (const dbFile of organizationFiles) {
      const subdomain = dbFile.replace('.db', '');
      const exists = organizations.some(org => org.subdomain === subdomain);
      
      if (!exists) {
        console.log(`Found organization database ${dbFile} that is not in main database. Adding to migration list.`);
        organizations.push({
          id: 'unknown',
          name: subdomain,
          subdomain,
          active: 1
        });
      }
    }

    // Update schema for each organization database
    for (const org of organizations) {
      console.log(`\nProcessing organization: ${org.name} (${org.subdomain})`);
      
      try {
        // Verificar se o arquivo de banco de dados existe
        const dbPath = path.join(organizationsDir, `${org.subdomain}.db`);
        try {
          await fs.access(dbPath);
          console.log(`  Database file exists: ${dbPath}`);
        } catch (error) {
          console.log(`  Database file does not exist: ${dbPath}`);
          console.log(`  Skipping organization ${org.subdomain}`);
          continue;
        }

        const orgDb = await db.getOrganizationDb(org.subdomain);

        // Verificar se a tabela proof_of_life existe
        try {
          orgDb.prepare('SELECT 1 FROM proof_of_life LIMIT 1').get();
        } catch (error) {
          console.log(`  Creating proof_of_life table...`);
          
          // A tabela não existe, criar do zero com a coluna cpf_url
          orgDb.exec(`
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
          `);
          
          console.log('  ✓ Table created successfully with cpf_url column');
          continue;
        }

        // Verificar se a coluna cpf_url já existe na tabela proof_of_life
        const columnExists = orgDb.prepare(`
          SELECT COUNT(*) as count FROM pragma_table_info('proof_of_life') 
          WHERE name='cpf_url'
        `).get() as { count: number };

        if (columnExists.count === 0) {
          console.log(`  Adding cpf_url column to proof_of_life table...`);
          
          try {
            // Iniciar transação
            orgDb.exec('BEGIN TRANSACTION');
            
            // Adicionar a coluna cpf_url
            orgDb.exec(`
              ALTER TABLE proof_of_life 
              ADD COLUMN cpf_url TEXT;
            `);

            // Atualizar os registros existentes com valor vazio
            orgDb.exec(`
              UPDATE proof_of_life
              SET cpf_url = '';
            `);

            // Commit da transação
            orgDb.exec('COMMIT');
            
            console.log('  ✓ Column added successfully and existing records updated');
          } catch (error) {
            // Rollback em caso de erro
            orgDb.exec('ROLLBACK');
            console.error(`  ✗ Error adding column:`, error);
            throw error;
          }
        } else {
          console.log(`  ✓ cpf_url column already exists`);
        }

        // Verificar se a coluna foi realmente adicionada
        const columnCheck = orgDb.prepare(`
          SELECT COUNT(*) as count FROM pragma_table_info('proof_of_life') 
          WHERE name='cpf_url'
        `).get() as { count: number };

        if (columnCheck.count === 1) {
          console.log(`  ✓ Column verification successful`);
          
          // Verificar se a coluna tem NOT NULL constraint
          const notNullCheck = orgDb.prepare(`
            SELECT "notnull" FROM pragma_table_info('proof_of_life') 
            WHERE name='cpf_url'
          `).get() as { notnull: number } | undefined;
          
          if (notNullCheck && notNullCheck.notnull === 0) {
            console.log(`  Adding NOT NULL constraint to cpf_url column...`);
            
            try {
              // Em SQLite não é possível adicionar constraint NOT NULL diretamente,
              // é necessário recriar a tabela
              
              // Iniciar transação
              orgDb.exec('BEGIN TRANSACTION');
              
              // Obter o schema da tabela
              const tableInfo = orgDb.prepare(`
                SELECT sql FROM sqlite_master WHERE name = 'proof_of_life' AND type = 'table'
              `).get() as { sql: string };
              
              // Criar tabela temporária com o schema atualizado
              const newTableSchema = tableInfo.sql.replace('cpf_url TEXT', 'cpf_url TEXT NOT NULL');
              
              // Renomear a tabela atual
              orgDb.exec(`ALTER TABLE proof_of_life RENAME TO proof_of_life_old;`);
              
              // Criar nova tabela com o schema atualizado
              orgDb.exec(newTableSchema);
              
              // Transferir dados
              orgDb.exec(`
                INSERT INTO proof_of_life 
                SELECT * FROM proof_of_life_old;
              `);
              
              // Remover tabela antiga
              orgDb.exec(`DROP TABLE proof_of_life_old;`);
              
              // Commit da transação
              orgDb.exec('COMMIT');
              
              console.log('  ✓ NOT NULL constraint added successfully');
            } catch (error) {
              // Rollback em caso de erro
              orgDb.exec('ROLLBACK');
              console.error(`  ✗ Error adding NOT NULL constraint:`, error);
              throw error;
            }
          } else {
            console.log(`  ✓ cpf_url column already has NOT NULL constraint`);
          }
        } else {
          throw new Error('Column verification failed');
        }

      } catch (error) {
        console.error(`Error processing organization ${org.subdomain}:`, error);
        if (isProduction) {
          // Em produção, falhar se houver erro
          throw error;
        } else {
          // Em desenvolvimento, continuar com a próxima organização
          continue;
        }
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