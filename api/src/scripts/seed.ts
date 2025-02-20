import { db } from '../lib/database';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente
config();

// Verifica se as variáveis de ambiente necessárias estão definidas
if (!process.env.SUPER_ADMIN_NAME || !process.env.SUPER_ADMIN_EMAIL || !process.env.SUPER_ADMIN_PASSWORD) {
  console.error('\x1b[31mErro: Variáveis de ambiente não configuradas!\x1b[0m');
  console.error('Por favor, configure as seguintes variáveis no arquivo .env:');
  console.error('- SUPER_ADMIN_NAME');
  console.error('- SUPER_ADMIN_EMAIL');
  console.error('- SUPER_ADMIN_PASSWORD');
  process.exit(1);
}

const SUPER_ADMIN = {
  name: process.env.SUPER_ADMIN_NAME,
  email: process.env.SUPER_ADMIN_EMAIL,
  password: process.env.SUPER_ADMIN_PASSWORD
};

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
    ).get(SUPER_ADMIN.email);

    if (!superAdmin) {
      const hashedPassword = await hash(SUPER_ADMIN.password, 8);
      mainDb.prepare(`
        INSERT INTO super_admins (id, name, email, password)
        VALUES (?, ?, ?, ?)
      `).run(
        randomUUID(),
        SUPER_ADMIN.name,
        SUPER_ADMIN.email,
        hashedPassword
      );
      console.log('✓ Super admin created');
      console.log('Super admin email:', SUPER_ADMIN.email);
      console.log('✓ Password set from environment variables');
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