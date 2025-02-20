import { db } from '../lib/database';

async function updateProofStatus() {
  try {
    console.log('Starting proof_of_life status update...');

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

      // Update the proof_of_life table with new status constraint
      orgDb.exec(`
        PRAGMA foreign_keys=off;
        
        BEGIN TRANSACTION;

        -- Create temporary table with new status constraint
        CREATE TABLE proof_of_life_temp (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          event_id TEXT,
          status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')),
          selfie_url TEXT NOT NULL,
          document_url TEXT NOT NULL,
          reviewed_at DATETIME,
          reviewed_by TEXT,
          comments TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES app_users(id),
          FOREIGN KEY (event_id) REFERENCES events(id),
          FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
        );

        -- Copy existing data
        INSERT INTO proof_of_life_temp 
        SELECT * FROM proof_of_life;

        -- Drop old table
        DROP TABLE proof_of_life;

        -- Rename new table
        ALTER TABLE proof_of_life_temp RENAME TO proof_of_life;

        COMMIT;

        PRAGMA foreign_keys=on;
      `);

      console.log(`✓ Updated proof_of_life table for ${org.subdomain}`);
    }

    console.log('\nDatabase update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateProofStatus();