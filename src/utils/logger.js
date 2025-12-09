//@ts-nocheck

const winston = require('winston');
require('winston-daily-rotate-file');

// Configuración problemática de logs (desordenada)
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    // Problema: formato no estructurado
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} ${level.toUpperCase()}: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Problema: logs rotan pero sin estructura clara
    new winston.transports.DailyRotateFile({
      filename: 'logs/transaction-validator-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]
});

// Métodos de ayuda
logger.logApiRequest = (req, res, responseTime) => {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
};

logger.logTransaction = (transactionId, action, details) => {
  logger.info(`Transaction ${action}`, {
    transactionId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;