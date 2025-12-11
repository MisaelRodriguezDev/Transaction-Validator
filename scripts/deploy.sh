#!/bin/bash
set -e

if [ -z "$RENDER_API_KEY" ]; then
  echo "ERROR: Debes configurar la variable de entorno RENDER_API_KEY"
  exit 1
fi

SERVICE_ID="<SERVICE-ID>"

echo "Desplegando en Render..."
render services update $SERVICE_ID \
  --image ghcr.io/$GITHUB_REPOSITORY_OWNER/transaction-validator:latest
