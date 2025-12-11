//@ts-nocheck
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json() // ← Log estructurado
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
  })
);

// 🔥 Transporte rotado para niveles
const rotatingFileTransport = (level) =>
  new transports.DailyRotateFile({
    level,
    dirname: 'logs',
    filename: `${level}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
  });

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new transports.Console({ format: consoleFormat }),

    // Archivos separados por nivel
    rotatingFileTransport('info'),
    rotatingFileTransport('error')
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' })
  ]
});

/* ============================================================================
   HELPERS PERSONALIZADOS
============================================================================ */

logger.logApiRequest = (req, res, responseTime) => {
  logger.info('API Request', {
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
};

logger.logTransaction = (transactionId, action, details = {}) => {
  logger.info(`Transaction ${action}`, {
    transactionId,
    ...details,
    occurredAt: new Date().toISOString()
  });
};

module.exports = logger;
