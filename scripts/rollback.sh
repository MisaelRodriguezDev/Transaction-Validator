#!/bin/bash
set -e

if [ -z "$RENDER_API_KEY" ]; then
  echo "ERROR: Debes configurar la variable de entorno RENDER_API_KEY"
  exit 1
fi

# Instalar Render CLI si no está
if ! command -v render &> /dev/null; then
  echo "Instalando Render CLI..."
  curl -sL https://cli.render.com/install | bash
fi

# Asegurar PATH
export PATH=$HOME/.render/bin:$PATH

SERVICE_ID="srv-d4t0k6hr0fns73e89iog"
PREVIOUS_IMAGE_TAG="previous"

echo "Haciendo rollback en Render..."
$HOME/.render/bin/render services update $SERVICE_ID \
  --image ghcr.io/misaelrodriguezdev/transaction-validator:$PREVIOUS_IMAGE_TAG
