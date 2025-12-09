//@ts-nocheck

const client = require('prom-client');

// Crear un Registry personalizado
const register = new client.Registry();

// Añadir métricas por defecto
client.collectDefaultMetrics({ register });

// Métricas personalizadas
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const errorCounter = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type']
});

// Registrar métricas
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(errorCounter);

// Middleware para capturar métricas
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;
  
  // Incrementar conexiones activas
  activeConnections.inc();
  
  res.end = function(...args) {
    const duration = (Date.now() - start) / 1000; // convertir a segundos
    
    // Registrar métricas
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.url, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.url, res.statusCode.toString()[0] + 'xx')
      .inc();
    
    // Decrementar conexiones activas
    activeConnections.dec();
    
    // Registrar errores
    if (res.statusCode >= 500) {
      errorCounter.labels('server_error').inc();
    } else if (res.statusCode >= 400) {
      errorCounter.labels('client_error').inc();
    }
    
    originalEnd.apply(res, args);
  };
  
  next();
};

// Endpoint para Prometheus
const setupMetrics = (app) => {
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      res.status(500).end(error);
    }
  });
};

module.exports = {
  metricsMiddleware,
  setupMetrics,
  register,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  activeConnections,
  errorCounter
};