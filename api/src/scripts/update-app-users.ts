import { db } from '../lib/database';

interface Organization {
  subdomain: string;
}

async function updateAppUsers() {
  try {
    console.log('Starting app_users table update...');

    const mainDb = db.getMainDb();
    
    // Get all active organizations
    const organizations = mainDb.prepare(`
      SELECT subdomain FROM organizations WHERE active = 1
    `).all() as Organization[];

    console.log(`Found ${organizations.length} active organizations`);

    // Update each organization's database
    for (const org of organizations) {
      console.log(`Updating database for organization: ${org.subdomain}`);
      
      const orgDb = await db.getOrganizationDb(org.subdomain);
      
      // Check and add can_proof_of_life column
      const hasProofOfLife = orgDb.prepare(`
        SELECT COUNT(*) as count FROM pragma_table_info('app_users') 
        WHERE name = 'can_proof_of_life'
      `).get() as { count: number };

      if (!hasProofOfLife.count) {
        orgDb.prepare(`
          ALTER TABLE app_users ADD COLUMN can_proof_of_life INTEGER DEFAULT 0
        `).run();
      }

      // Check and add can_recadastration column
      const hasRecadastration = orgDb.prepare(`
        SELECT COUNT(*) as count FROM pragma_table_info('app_users') 
        WHERE name = 'can_recadastration'
      `).get() as { count: number };

      if (!hasRecadastration.count) {
        orgDb.prepare(`
          ALTER TABLE app_users ADD COLUMN can_recadastration INTEGER DEFAULT 0
        `).run();
      }

      console.log(`✓ Updated app_users table for ${org.subdomain}`);
    }

    console.log('\nDatabase update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateAppUsers();