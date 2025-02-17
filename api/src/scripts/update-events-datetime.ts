import { db } from '../lib/database';

interface DatabaseEvent {
  id: string;
  type: 'PROOF_OF_LIFE' | 'RECADASTRATION';
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  active: number;
  created_at: string;
  updated_at: string;
}

async function updateEventsDatetime() {
  try {
    console.log('Starting events datetime update...');

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

      // Update the events table to use DATETIME
      orgDb.exec(`
        PRAGMA foreign_keys=off;
        
        BEGIN TRANSACTION;

        -- Create temporary table with DATETIME columns
        CREATE TABLE events_temp (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK (type IN ('PROOF_OF_LIFE', 'RECADASTRATION')),
          title TEXT NOT NULL,
          description TEXT,
          start_date DATETIME NOT NULL,
          end_date DATETIME NOT NULL,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Copy existing data with datetime conversion
        INSERT INTO events_temp 
        SELECT 
          id,
          type,
          title,
          description,
          CASE 
            WHEN start_date LIKE '%T%' THEN start_date
            ELSE start_date || 'T00:00:00-03:00'
          END as start_date,
          CASE 
            WHEN end_date LIKE '%T%' THEN end_date
            ELSE end_date || 'T23:59:59-03:00'
          END as end_date,
          active,
          created_at,
          updated_at
        FROM events;

        -- Drop old table
        DROP TABLE events;

        -- Rename new table
        ALTER TABLE events_temp RENAME TO events;

        COMMIT;

        PRAGMA foreign_keys=on;
      `);

      console.log(`✓ Updated events table for ${org.subdomain}`);
    }

    console.log('\nDatabase update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateEventsDatetime();
