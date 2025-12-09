//@ts-nocheck
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Problema: Logging inconsistente y desordenado
  console.error('ERROR:', err.message);
  logger.error(`Error: ${err.message} - ${req.url} - ${req.method}`);
  
  // Problema: No se captura suficiente contexto
  const statusCode = err.statusCode || 500;
  
  // Problema: Respuesta de error no estructurada
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    // Problema: Exponer detalles en producción
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};

module.exports = errorHandler;