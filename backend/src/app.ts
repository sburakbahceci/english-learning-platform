import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import levelsRoutes from './modules/levels/levels.routes'; // ← YENİ

dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API info endpoint
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    message: 'English Learning Platform API v1',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      levels: '/api/v1/levels',
      auth: '/api/v1/auth (coming soon)',
      users: '/api/v1/users (coming soon)',
    },
  });
});

// Routes - YENİ
app.use('/api/v1/levels', levelsRoutes); // ← YENİ

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

export default app;
