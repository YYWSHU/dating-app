import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import { apiLimiter } from './lib/rate-limiter.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import matchRoutes from './modules/match/match.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import locationRoutes from './modules/location/location.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import questionnaireRoutes from './modules/questionnaire/questionnaire.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Global rate limit
  app.use('/api', apiLimiter);

  // Middleware
  app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Health check (no rate limit)
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes - order matters: specific before generic
  app.use('/api/auth', authRoutes);
  app.use('/api', matchRoutes);
  app.use('/api', questionnaireRoutes);
  app.use('/api', adminRoutes);
  app.use('/api', chatRoutes);
  app.use('/api', locationRoutes);
  app.use('/api', userRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
