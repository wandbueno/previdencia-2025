import { db } from '../lib/database';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
  try {
    console.log('Starting migration...');

    // Create data directories if they don't exist
    const dataDir = path.join(process.cwd(), 'data');
    const organizationsDir = path.join(dataDir, 'organizations');
    const uploadsDir = path.join(process.cwd(), 'uploads');

    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(organizationsDir, { recursive: true });
    await fs.mkdir(uploadsDir, { recursive: true });

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

      // Drop existing proof_of_life_history table if exists
      orgDb.exec(`DROP TABLE IF EXISTS proof_of_life_history;`);

      // Create new proof_of_life_history table with correct schema
      orgDb.exec(`
        CREATE TABLE proof_of_life_history (
          id TEXT PRIMARY KEY,
          proof_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          event_id TEXT NOT NULL,
          action TEXT NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED')),
          comments TEXT,
          reviewed_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (proof_id) REFERENCES proof_of_life(id),
          FOREIGN KEY (user_id) REFERENCES app_users(id),
          FOREIGN KEY (event_id) REFERENCES events(id),
          FOREIGN KEY (reviewed_by) REFERENCES admin_users(id)
        );
      `);

      console.log(`✓ Updated schema for organization: ${org.subdomain}`);
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();