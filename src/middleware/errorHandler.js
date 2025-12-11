//@ts-nocheck
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Construimos metadata del error
  const errorMeta = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Logging estructurado (sin console.error)
  logger.error(err.message || 'Unhandled error', errorMeta);

  // Respuesta estándar SIN revelar detalles sensibles
  const response = {
    success: false,
    error: err.name || 'Error',
    message:
      statusCode >= 500
        ? 'Internal Server Error'
        : err.message || 'An error occurred',
  };

  // Mostrar detalles solo en desarrollo (seguro)
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      message: err.message,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
