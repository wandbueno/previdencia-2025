import { db } from '../lib/database';

async function addDocumentBackUrl() {
  try {
    console.log('Starting migration to rename document_url and add document_back_url column...');

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
      
      try {
        // Disable foreign keys temporarily
        orgDb.prepare('PRAGMA foreign_keys=OFF').run();
        
        // Start transaction
        orgDb.prepare('BEGIN TRANSACTION').run();

        // Create temporary table with new schema
        orgDb.prepare(`
          CREATE TABLE proof_of_life_temp (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            event_id TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')),
            selfie_url TEXT NOT NULL,
            document_front_url TEXT NOT NULL,
            document_back_url TEXT NOT NULL,
            reviewed_at DATETIME,
            reviewed_by TEXT,
            comments TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES app_users(id),
            FOREIGN KEY (event_id) REFERENCES events(id),
            FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
          )
        `).run();

        // Copy data from old table to new table, renaming document_url to document_front_url
        // and setting document_back_url to the same value initially
        orgDb.prepare(`
          INSERT INTO proof_of_life_temp 
          SELECT 
            id, user_id, event_id, status, selfie_url,
            document_url as document_front_url,
            document_url as document_back_url,
            reviewed_at, reviewed_by, comments, created_at, updated_at
          FROM proof_of_life
        `).run();

        // Drop old table and rename new table
        orgDb.prepare('DROP TABLE proof_of_life').run();
        orgDb.prepare('ALTER TABLE proof_of_life_temp RENAME TO proof_of_life').run();

        // Add indexes - one at a time
        orgDb.prepare('CREATE INDEX IF NOT EXISTS idx_proof_of_life_user_id ON proof_of_life(user_id)').run();
        orgDb.prepare('CREATE INDEX IF NOT EXISTS idx_proof_of_life_event_id ON proof_of_life(event_id)').run();
        orgDb.prepare('CREATE INDEX IF NOT EXISTS idx_proof_of_life_reviewed_by ON proof_of_life(reviewed_by)').run();

        console.log('✓ Migration completed successfully for this organization');

        // Commit transaction
        orgDb.prepare('COMMIT').run();

        // Re-enable foreign keys
        orgDb.prepare('PRAGMA foreign_keys=ON').run();

      } catch (error) {
        // Rollback on error
        orgDb.prepare('ROLLBACK').run();
        
        // Re-enable foreign keys even on error
        orgDb.prepare('PRAGMA foreign_keys=ON').run();
        
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

addDocumentBackUrl();