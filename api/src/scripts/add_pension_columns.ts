import { db } from '../lib/database';

async function addPensionColumns() {
  try {
    console.log('Starting app_users table update to add pension and legal representative columns...');

    const mainDb = db.getMainDb();
    
    // Get all active organizations
    const organizations = mainDb.prepare(`
      SELECT subdomain FROM organizations WHERE active = 1
    `).all() as { subdomain: string }[];

    console.log(`Found ${organizations.length} active organizations`);

    // Update each organization's database
    for (const org of organizations) {
      console.log(`\nUpdating database for organization: ${org.subdomain}`);
      
      const orgDb = await db.getOrganizationDb(org.subdomain);
      
      // Start transaction
      orgDb.prepare('BEGIN TRANSACTION').run();

      try {
        // Check if pension_grantor_name column exists
        const hasPensionGrantor = orgDb.prepare(`
          SELECT COUNT(*) as count FROM pragma_table_info('app_users') 
          WHERE name = 'pension_grantor_name'
        `).get() as { count: number };

        if (!hasPensionGrantor.count) {
          // Add pension_grantor_name column if it doesn't exist
          orgDb.prepare(`
            ALTER TABLE app_users 
            ADD COLUMN pension_grantor_name TEXT
          `).run();

          console.log(`✓ Added pension_grantor_name column to app_users table for ${org.subdomain}`);
        } else {
          console.log(`✓ pension_grantor_name column already exists in ${org.subdomain}`);
        }

        // Check if legal_representative column exists
        const hasLegalRep = orgDb.prepare(`
          SELECT COUNT(*) as count FROM pragma_table_info('app_users') 
          WHERE name = 'legal_representative'
        `).get() as { count: number };

        if (!hasLegalRep.count) {
          // Add legal_representative column if it doesn't exist
          orgDb.prepare(`
            ALTER TABLE app_users 
            ADD COLUMN legal_representative TEXT
          `).run();

          console.log(`✓ Added legal_representative column to app_users table for ${org.subdomain}`);
        } else {
          console.log(`✓ legal_representative column already exists in ${org.subdomain}`);
        }

        // Commit transaction
        orgDb.prepare('COMMIT').run();
        console.log(`✓ Successfully updated ${org.subdomain}`);
      } catch (error) {
        // Rollback on error
        orgDb.prepare('ROLLBACK').run();
        console.error(`Error updating ${org.subdomain}:`, error);
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully');
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    process.exit(1);
  }
}

addPensionColumns();
