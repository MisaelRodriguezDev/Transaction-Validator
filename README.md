# Transaction-Validator V1

**Versión problemática con los siguientes problemas (simulado):**
- Alta latencia en horarios pico
- 0.8% de errores 500
- Logs desordenados e inconsistentes
- Despliegues manuales con downtime
- Monitoreo incompleto

## Endpoints
- POST `/api/v1/transactions/validate`
- POST `/api/v1/transactions/batch-validate`

## Problemas Conocidos
1. Memory leaks en procesamiento de batches
2. Timeouts en consultas a base de datos
3. Logging inconsistente
4. No hay estrategia de despliegue profesional