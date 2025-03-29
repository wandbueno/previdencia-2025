import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { setupMultiTenancy } from './middlewares/multiTenancy';
import { db } from './lib/database';
import path from 'path';
import { debugRouter } from './routes/debug.routes';

// Load environment variables
config();

const app = express();

// Configure CORS - Moving this BEFORE other middleware
app.use(cors({
  origin: '*', // In production, replace with your actual domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-subdomain'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add headers middleware for additional CORS support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-organization-subdomain');
  next();
});

app.use(express.json());

// Determinar os caminhos para uploads e backups baseado no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const baseDir = isProduction ? '/data' : process.cwd();

const uploadsPath = path.join(baseDir, 'uploads');
const backupsPath = path.join(baseDir, 'backups');

console.log(`[SERVER] Configurando diretórios:`);
console.log(`- Uploads: ${uploadsPath}`);
console.log(`- Backups: ${backupsPath}`);

// Middleware para logging de requisições de arquivos estáticos
const logStaticRequests = (prefix: string) => (req: Request, res: Response, next: NextFunction) => {
  console.log(`[STATIC] Requisição para ${prefix}: ${req.url}`);
  const filePath = path.join(prefix === '/uploads' ? uploadsPath : backupsPath, req.url);
  
  // Verificar se o arquivo existe
  import('fs').then(fs => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`[STATIC] ERRO: Arquivo não encontrado: ${filePath}`);
      } else {
        console.log(`[STATIC] Arquivo encontrado: ${filePath}`);
      }
      next();
    });
  }).catch(error => {
    console.error(`[STATIC] Erro ao verificar arquivo: ${error}`);
    next();
  });
};

// Servir arquivos estáticos
app.use('/uploads', logStaticRequests('/uploads'), express.static(uploadsPath, {
  etag: true,
  lastModified: true,
  maxAge: '1d',
  fallthrough: false
}));

app.use('/backups-files', logStaticRequests('/backups-files'), express.static(backupsPath, {
  etag: true,
  lastModified: true,
  maxAge: '1d',
  fallthrough: false
}));

// Servir placeholder para imagens não encontradas
app.get('/placeholder-image.png', (req, res) => {
  res.redirect('https://via.placeholder.com/150?text=Imagem+não+encontrada');
});

// Initialize database before starting the server
async function startServer() {
  try {
    // Setup database
    await db.initialize();
    console.log('✓ Database connected.');

    // Log database path
    const mainDb = db.getMainDb();
    const dbPath = mainDb.name;
    console.log('📁 Database path:', dbPath);

    // Log organizations for debugging
    const orgs = mainDb.prepare('SELECT * FROM organizations WHERE active = 1').all();
    console.log('📊 Active organizations:', orgs);

    // Setup multi-tenancy based on subdomain
    app.use(setupMultiTenancy);

    // Add request logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });

    // Root route
    app.get('/', (req, res) => {
      res.json({ success: true, message: 'API Previdência 2025 - Serviço funcionando!' });
    });

    // API routes
    app.use('/api', routes);
    
    // Debug routes
    app.use('/api/debug', debugRouter);

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
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();