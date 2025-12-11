//@ts-nocheck
const client = require('prom-client');
const onFinished = require('on-finished');

// Crear un Registry personalizado
const register = new client.Registry();

// Añadir métricas por defecto
client.collectDefaultMetrics({ register });

// -----------------------------------------------------------------------------
// MÉTRICAS PERSONALIZADAS
// -----------------------------------------------------------------------------

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_group']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active HTTP connections'
});

const errorCounter = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type']
});

// Registrar métricas
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(errorCounter);

// -----------------------------------------------------------------------------
// MIDDLEWARE PRINCIPAL DE MÉTRICAS
// -----------------------------------------------------------------------------

const metricsMiddleware = (req, res, next) => {
  const startInMs = Date.now();

  activeConnections.inc();

  // Detecta cuando la respuesta termina sin monkey-patching
  onFinished(res, () => {
    const durationSec = (Date.now() - startInMs) / 1000;

    // Detecta el route (si existe), si no usa path estático
    const route =
      req.route?.path ||
      req.originalUrl.split('?')[0] ||
      req.url.split('?')[0];

    // Bucket de duración
    httpRequestDurationSeconds
      .labels(req.method, route, String(res.statusCode))
      .observe(durationSec);

    // Contador total
    const statusGroup = `${String(res.statusCode)[0]}xx`;

    httpRequestsTotal
      .labels(req.method, route, statusGroup)
      .inc();

    // Decremento de conexiones activas
    activeConnections.dec();

    // Errores
    if (res.statusCode >= 500) {
      errorCounter.labels('server_error').inc();
    } else if (res.statusCode >= 400) {
      errorCounter.labels('client_error').inc();
    }
  });

  next();
};

// -----------------------------------------------------------------------------
// ENDPOINT /metrics
// -----------------------------------------------------------------------------

const setupMetrics = (app) => {
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.send(await register.metrics());
    } catch (error) {
      res.status(500).send(`Error generating metrics: ${error.message}`);
    }
  });
};

// -----------------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------------

module.exports = {
  metricsMiddleware,
  setupMetrics,
  register,
  httpRequestDurationSeconds,
  httpRequestsTotal,
  activeConnections,
  errorCounter
};
