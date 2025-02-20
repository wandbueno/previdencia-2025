import { db } from '../lib/database';

interface Organization {
  subdomain: string;
}

async function addPensionColumns() {
  try {
    // Get all organization databases
    const mainDb = db.getMainDb();
    const organizations = mainDb.prepare('SELECT subdomain FROM organizations').all() as Organization[];

    for (const org of organizations) {
      const orgDb = await db.getOrganizationDb(org.subdomain);
      
      // Check if columns exist before adding them
      const tableInfo = orgDb.prepare("PRAGMA table_info(app_users)").all();
      const columns = tableInfo.map((col: any) => col.name);
      
      // Add pension_grantor_name column if it doesn't exist
      if (!columns.includes('pension_grantor_name')) {
        orgDb.exec(`
          ALTER TABLE app_users 
          ADD COLUMN pension_grantor_name TEXT;
        `);
      }

      // Add legal_representative column if it doesn't exist
      if (!columns.includes('legal_representative')) {
        orgDb.exec(`
          ALTER TABLE app_users 
          ADD COLUMN legal_representative TEXT;
        `);
      }

      console.log(`Checked/added pension columns to database for organization: ${org.subdomain}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

addPensionColumns();
