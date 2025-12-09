//@ts-nocheck

const app = require('./app');
const logger = require('./utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Simulación de problemas en la versión 1
process.on('SIGTERM', () => {
  logger.error('Received SIGTERM. Service shutting down...');
  // Simula un cierre lento
  setTimeout(() => {
    process.exit(0);
  }, 10000); // 10 segundos de delay
});

// Simula problemas de memoria (memory leak)
let memoryLeak = [];
setInterval(() => {
  if (Math.random() < 0.3) { // 30% de probabilidad
    memoryLeak.push(new Array(1000).fill('memory_leak_data'));
  }
}, 10000);

// Simula alta latencia en horarios pico
app.use((req, res, next) => {
  const hour = new Date().getHours();
  if ((hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 17)) {
    // Horario pico: agrega latencia aleatoria
    const delay = Math.floor(Math.random() * 2000) + 500; // 500-2500ms
    setTimeout(next, delay);
  } else {
    next();
  }
});

const server = app.listen(PORT, () => {
  logger.info(`Transaction Validator V1 running on port ${PORT}`);
  logger.warn('This version has known performance issues');
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // En producción, deberíamos reiniciar el servicio
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;