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

app.use(cors());
app.use(express.json());

// Determinar o caminho para uploads baseado no ambiente
const uploadsPath = process.env.NODE_ENV === 'production'
  ? '/data/uploads'
  : path.join(process.cwd(), 'uploads');

console.log(`[SERVER] Configurando pasta de uploads: ${uploadsPath}`);

// Middleware para logging de requisições de arquivos estáticos
app.use('/uploads', (req, res, next) => {
  console.log(`[STATIC] Requisição para arquivo: ${req.url}`);
  const filePath = path.join(uploadsPath, req.url);
  
  // Verificar se o arquivo existe
  import('fs').then(fs => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`[STATIC] ERRO: Arquivo não encontrado: ${filePath}`);
        // Continuar para o próximo middleware mesmo se o arquivo não existir
        // O express.static irá retornar 404 apropriadamente
      } else {
        console.log(`[STATIC] Arquivo encontrado: ${filePath}`);
      }
      next();
    });
  }).catch(error => {
    console.error(`[STATIC] Erro ao verificar arquivo: ${error}`);
    next();
  });
});

// Servir arquivos estáticos da pasta uploads com opções detalhadas
app.use('/uploads', express.static(uploadsPath, {
  etag: true,           // Habilitar ETag para cache eficiente
  lastModified: true,   // Enviar cabeçalho Last-Modified
  maxAge: '1d',         // Cache por 1 dia
  fallthrough: false    // Retornar erro 404 explícito
}));

// Servir placeholder para imagens não encontradas
app.get('/placeholder-image.png', (req, res) => {
  // URL de uma imagem placeholder genérica online
  // Idealmente você deveria ter esta imagem no seu servidor
  res.redirect('https://via.placeholder.com/150?text=Imagem+não+encontrada');
});

// Servir arquivos estáticos da pasta backups
app.use('/backups-files', express.static(path.join(process.cwd(), 'backups')));

// Initialize database before starting the server
async function startServer() {
  try {
    // Setup database
    await db.initialize();
    console.log('✓ Database connected.');

    // Setup multi-tenancy based on subdomain
    app.use(setupMultiTenancy);

    // Rota para verificar se o servidor está em funcionamento
    app.get('/', (req, res) => {
      res.json({ success: true, message: 'API Previdência 2025 - Serviço funcionando!' });
    });

    // Rotas da API
    app.use('/api', routes);
    
    // Adicionar rotas de debug separadamente (não são parte do sistema principal)
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
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();