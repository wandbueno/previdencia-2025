import { db } from '../lib/database';

async function addPhoneNumber() {
  try {
    console.log('Starting app_users table update to add phone number...');

    const mainDb = db.getMainDb();
    
    // Get all active organizations
    const organizations = mainDb.prepare(`
      SELECT subdomain FROM organizations WHERE active = 1
    `).all() as { subdomain: string }[];

    console.log(`Found ${organizations.length} active organizations`);

    // Update each organization's database
    for (const org of organizations) {
      console.log(`Updating database for organization: ${org.subdomain}`);
      
      const orgDb = await db.getOrganizationDb(org.subdomain);
      
      // Check if phone column exists
      const hasColumn = orgDb.prepare(`
        SELECT COUNT(*) as count FROM pragma_table_info('app_users') 
        WHERE name = 'phone'
      `).get() as { count: number };

      if (!hasColumn.count) {
        // Add phone column if it doesn't exist
        orgDb.prepare(`
          ALTER TABLE app_users 
          ADD COLUMN phone TEXT
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

addPhoneNumber();