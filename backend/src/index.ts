import express from 'express';
import cors from 'cors';
import { validateEnv, env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { checkSupabaseConnection } from './config/supabase';


// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);

}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const apiRouter = express.Router();

apiRouter.get('/health', async (req, res) => {
  // Check Supabase connection non-destructively
  const dbConnected = await checkSupabaseConnection();

  res.json({
    success: true,
    data: {
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected'
    },
    error: null
  });
});

import patientRoutes from './routes/patient.routes';
import encounterRoutes from './routes/encounter.routes';
import clinicalNoteRoutes from './routes/clinicalNote.routes';
import extractionRoutes from './routes/extraction.routes';

// Use API v1 namespace
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/encounters', encounterRoutes);
app.use('/api/v1/encounters', extractionRoutes);
app.use('/api/v1/notes', clinicalNoteRoutes);
app.use('/api/v1', apiRouter);

// Error Handler Middleware
app.use(errorHandler);

// Start Server only if not required by tests
if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`Local: http://localhost:${env.PORT}`);
    console.log(`API: http://localhost:${env.PORT}/api/v1`);

    // Test DB Connection
    checkSupabaseConnection().then((connected) => {
      if (connected) {
        console.log('✅ Supabase connection verified');
      } else {
        console.log('❌ Supabase connection failed');
      }
    });
  });
}

export default app;
