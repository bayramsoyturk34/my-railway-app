// server/index.js - Updated with validation middleware
import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler, jsonParser } from './middleware/validation.js';
import userRoutes from './routes/user-validated.js';

const app = express();

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://web-production-02170.up.railway.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Custom JSON parser with error handling
app.use(jsonParser);

// Body size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes with validation
app.use('/api/auth', userRoutes);

// Add other routes here...
// app.use('/api/projects', projectRoutes);
// app.use('/api/notifications', notificationRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // Catch-all handler for SPA routing
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

// 404 handler for unrecognized routes (MUST be before error handler)
app.use(notFoundHandler);

// Global error handler (MUST be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;