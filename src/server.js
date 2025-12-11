//@ts-nocheck
require('dotenv').config();
require('./tracing');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// -------------------------------
// START SERVER
// -------------------------------
const server = app.listen(PORT, () => {
  logger.info('Transaction Validator running', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// -------------------------------
// GRACEFUL SHUTDOWN
// -------------------------------
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    logger.info('All connections closed. Exiting process.');
    process.exit(0);
  });

  // Forzar cierre después de 10s
  setTimeout(() => {
    logger.warn('Forcing shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// -------------------------------
// ERROR HANDLING
// -------------------------------
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise
  });
});

module.exports = server;
