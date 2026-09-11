import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensurePostgresRunning } from './db/embeddedServer.js';
import { prisma } from './db/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      service: 'MediCare Hospital Management System API',
      database: 'PostgreSQL Connected',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'degraded',
      service: 'MediCare API',
      database: 'Disconnected',
      error: err.message
    });
  }
});

app.use('/api', apiRouter);
app.use(errorHandler);

export async function bootstrap() {
  try {
    console.log('--- Initializing MediCare HMS Backend Service ---');
    await ensurePostgresRunning();

    try {
      await prisma.$queryRawUnsafe('SELECT 1');
      console.log('[Database] PostgreSQL connection established successfully.');
    } catch (e: any) {
      console.warn('[Database] Initial connection check warning:', e.message);
    }

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`MediCare API server running on: http://localhost:${PORT}`);
        console.log(`Healthcheck: http://localhost:${PORT}/health`);
        console.log(`API Base: http://localhost:${PORT}/api`);
      });
    }
  } catch (error) {
    console.error('Failed to bootstrap server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export default app;
