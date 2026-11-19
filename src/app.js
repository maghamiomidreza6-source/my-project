const express = require('express');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Request parsing & middlewares
app.use(express.json());

// Request tracer & access logger
app.use((req, res, next) => {
  const reqStart = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - reqStart;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${elapsed}ms)`);
  });
  next();
});

// Health & Liveness Probe
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json({
    status: 'HEALTHY',
    service: 'issue-tracker-backend',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount modular sub-routers
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
