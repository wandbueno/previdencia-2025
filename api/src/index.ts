import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { setupMultiTenancy } from './middlewares/multiTenancy';
import { db } from './lib/database';
import path from 'path';

// Load environment variables
config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Servir arquivos estáticos da pasta backups
app.use('/backups-files', express.static(path.join(process.cwd(), 'backups')));

// Initialize database before starting the server
async function startServer() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');

    // Setup multi-tenancy based on subdomain
    app.use(setupMultiTenancy);

    // API routes
    app.use('/api', routes);

    // Error handling middleware
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;

    // Cleanup database connections on server shutdown
    process.on('SIGINT', () => {
      db.disconnectAll();
      process.exit();
    });

    process.on('SIGTERM', () => {
      db.disconnectAll();
      process.exit();
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();