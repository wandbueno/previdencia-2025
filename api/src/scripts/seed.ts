import { db } from '../lib/database';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

async function seed() {
  try {
    console.log('Starting seed...');

    // Initialize database
    await db.initialize();
    console.log('✓ Database initialized');

    const mainDb = db.getMainDb();

    // Create super admin if it doesn't exist
    const superAdmin = mainDb.prepare(
      'SELECT 1 FROM super_admins WHERE email = ?'
    ).get('admin@example.com');

    if (!superAdmin) {
      const hashedPassword = await hash('admin123', 8);
      mainDb.prepare(`
        INSERT INTO super_admins (id, name, email, password)
        VALUES (?, ?, ?, ?)
      `).run(
        randomUUID(),
        'Super Admin',
        'admin@example.com',
        hashedPassword
      );
      console.log('✓ Super admin created');
      console.log('Super admin credentials:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    } else {
      console.log('✓ Super admin already exists');
    }

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();