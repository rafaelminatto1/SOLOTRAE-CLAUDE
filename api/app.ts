/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import * as cors from 'cors';
import * as path from 'path';
import authRoutes from './routes/auth.js';
import patientsRoutes from './routes/patients.js';
import physiotherapistsRoutes from './routes/physiotherapists.js';
import appointmentsRoutes from './routes/appointments.js';
import exercisesRoutes from './routes/exercises.js';
import treatmentPlansRoutes from './routes/treatment-plans.js';
import progressRoutes from './routes/progress.js';
import notificationsRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import { initializeDatabase } from './database/index.js';

// Initialize database
initializeDatabase().catch(console.error);


const app: express.Application = express();

// CORS configuration using environment variables
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors.default(corsOptions));

// Body parsing with configurable limits
const uploadLimit = process.env.UPLOAD_MAX_SIZE || '10mb';
app.use(express.json({ limit: uploadLimit }));
app.use(express.urlencoded({ extended: true, limit: uploadLimit }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/physiotherapists', physiotherapistsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/treatment-plans', treatmentPlansRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

/**
 * health
 */
app.use('/api/health', (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({
    success: true,
    message: 'ok'
  });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;