import { db } from '../lib/database';

async function updateEmailColumn() {
  try {
    console.log('Starting app_users table update to modify email column...');

    const mainDb = db.getMainDb();
    
    // Obter todas as organizações ativas
    const organizations = mainDb.prepare(`
      SELECT subdomain FROM organizations WHERE active = 1
    `).all() as { subdomain: string }[];

    console.log(`Found ${organizations.length} active organizations`);

    for (const org of organizations) {
      console.log(`Updating database for organization: ${org.subdomain}`);
      
      const orgDb = await db.getOrganizationDb(org.subdomain);
      
      // Verificar se a coluna email já tem a configuração desejada
      const emailColumn = orgDb.prepare(`
        SELECT type, notnull FROM pragma_table_info('app_users') WHERE name = 'email'
      `).get() as { type: string; notnull: number } | undefined;

      if (emailColumn) {
        if (emailColumn.notnull === 0) {
          console.log(`✓ Email column in ${org.subdomain} is already correctly set.`);
          continue;
        }

        console.log(`⚠️ Modifying email column in ${org.subdomain}...`);

        // Criar nova tabela com TODAS as colunas da tabela original, alterando apenas o campo email
        orgDb.prepare(`
          CREATE TABLE app_users_temp (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NULL, -- Permite valores NULL, mas continua único
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')),
            active INTEGER DEFAULT 1,
            can_proof_of_life INTEGER DEFAULT 0,
            can_recadastration INTEGER DEFAULT 0,
            rg TEXT,
            birth_date TEXT,
            address TEXT,
            registration_number TEXT,
            process_number TEXT,
            benefit_start_date TEXT,
            benefit_end_date TEXT,
            benefit_type TEXT,
            retirement_type TEXT,
            insured_name TEXT,
            legal_representative TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run();

        // Copiar todos os dados da tabela original para a nova tabela
        orgDb.prepare(`
          INSERT INTO app_users_temp 
          SELECT 
            id, name, cpf, email, password, role, active, 
            can_proof_of_life, can_recadastration, rg, birth_date, address, 
            registration_number, process_number, benefit_start_date, 
            benefit_end_date, benefit_type, retirement_type, insured_name, 
            legal_representative, created_at, updated_at
          FROM app_users
        `).run();

        // Renomear a tabela original para backup
        orgDb.prepare(`ALTER TABLE app_users RENAME TO app_users_backup`).run();

        // Renomear a nova tabela para app_users
        orgDb.prepare(`ALTER TABLE app_users_temp RENAME TO app_users`).run();

        // Remover a tabela antiga (backup)
        orgDb.prepare(`DROP TABLE app_users_backup`).run();

        console.log(`✓ Email column updated in app_users for ${org.subdomain}`);
      }
    }

    console.log('\n✅ Database update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
}

updateEmailColumn();
