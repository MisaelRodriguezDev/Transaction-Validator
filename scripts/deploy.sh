#!/bin/bash
set -e

# Asegurar que la variable de entorno RENDER_API_KEY esté configurada
if [ -z "$RENDER_API_KEY" ]; then
  echo "ERROR: Debes configurar la variable de entorno RENDER_API_KEY"
  exit 1
fi

SERVICE_ID="srv-d4t0k6hr0fns73e89iog"

echo "Desplegando en Render..."
# El comando 'render' funcionará porque el PATH fue actualizado en el .yml
render services update $SERVICE_ID \
  --image ghcr.io/misaelrodriguezdev/transaction-validator:latest