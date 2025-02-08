import { db } from '../lib/database';

async function updateEmailColumn() {
  try {
    console.log('Starting app_users table update to modify email column...');

    const mainDb = db.getMainDb();
    
    // Get all active organizations
    const organizations = mainDb.prepare(`
      SELECT subdomain FROM organizations WHERE active = 1
    `).all() as { subdomain: string }[];

    console.log(`Found ${organizations.length} active organizations`);

    for (const org of organizations) {
      console.log(`Updating database for organization: ${org.subdomain}`);
      
      const orgDb = await db.getOrganizationDb(org.subdomain);
      
      // Check if email column exists and its configuration
      const emailColumn = orgDb.prepare(`
        SELECT "type", "notnull" FROM pragma_table_info('app_users') WHERE name = 'email'
      `).get() as { type: string; notnull: number } | undefined;

      if (emailColumn) {
        if (emailColumn.notnull === 0) {
          console.log(`✓ Email column in ${org.subdomain} is already correctly set.`);
          continue;
        }

        console.log(`⚠️ Modifying email column in ${org.subdomain}...`);

        // Start transaction
        orgDb.prepare('BEGIN TRANSACTION').run();

        try {
          // Create temporary table with desired schema
          orgDb.prepare(`
            CREATE TABLE app_users_temp (
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
              benefit_type TEXT,
              retirement_type TEXT,
              insured_name TEXT,
              legal_representative TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();

          // Copy data from old table to new table
          orgDb.prepare(`
            INSERT INTO app_users_temp 
            SELECT * FROM app_users
          `).run();

          // Drop old table and rename new one
          orgDb.prepare('DROP TABLE app_users').run();
          orgDb.prepare('ALTER TABLE app_users_temp RENAME TO app_users').run();

          // Commit transaction
          orgDb.prepare('COMMIT').run();

          console.log(`✓ Email column updated in app_users for ${org.subdomain}`);
        } catch (error) {
          // Rollback on error
          orgDb.prepare('ROLLBACK').run();
          throw error;
        }
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