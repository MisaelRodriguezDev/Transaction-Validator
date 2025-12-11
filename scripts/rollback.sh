#!/bin/bash
set -e

if [ -z "$RENDER_API_KEY" ]; then
  echo "ERROR: Debes configurar la variable de entorno RENDER_API_KEY"
  exit 1
fi

SERVICE_ID="srv-d4t0k6hr0fns73e89iog"
PREVIOUS_IMAGE_TAG="previous"

echo "Haciendo rollback en Render..."
render services update $SERVICE_ID \
  --image ghcr.io/misaelrodriguezdev/transaction-validator:$PREVIOUS_IMAGE_TAG
