//@ts-nocheck

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const { metricsMiddleware, setupMetrics } = require('./middleware/metrics');
const logger = require('./utils/logger');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// -------------------------------
// SECURITY & PARSING
// -------------------------------
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Limitar tamaño de payload

// -------------------------------
// RATE LIMITING
// -------------------------------
if (process.env.NODE_ENV !== 'development') {

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again later.' }
  });
  app.use('/api', apiLimiter);
}

// -------------------------------
// METRICS
// -------------------------------
setupMetrics(app);
app.use(metricsMiddleware);

// -------------------------------
// LOGGING MIDDLEWARE
// -------------------------------
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// -------------------------------
// ROUTES
// -------------------------------
app.use('/api/v1/transactions', transactionRoutes);

// -------------------------------
// HEALTH CHECK
// -------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'transaction-validator-v2',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------
// 404 HANDLER
// -------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// -------------------------------
// ERROR HANDLER
// -------------------------------
app.use(errorHandler);

module.exports = app;
