import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import levelsRoutes from './modules/levels/levels.routes';
import usersRoutes from './modules/users/users.routes';
import lessonsRoutes from './modules/lessons/lessons.routes';
import examsRoutes from './modules/exams/exams.routes';
import podcastsRoutes from './modules/podcasts/podcasts.routes';
import aiRoutes from './modules/ai/ai.routes';

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use('/api/v1/podcasts', podcastsRoutes);
app.use('/api/v1/ai', aiRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    name: 'Lingoria API',
    description: 'AI-Powered English Learning Platform',
    version: '1.0.0',
    contact: 'hello.lingoria@gmail.com',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth/google',
      users: '/api/v1/users/me',
      levels: '/api/v1/levels',
      lessons: '/api/v1/lessons',
      exams: '/api/v1/exams',
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/levels', levelsRoutes);
app.use('/api/v1/lessons', lessonsRoutes);
app.use('/api/v1/exams', examsRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

// Error Handler
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
