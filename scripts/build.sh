#!/bin/bash
set -e

# Convertir repo owner a minúsculas
REPO_LOWER=$(echo "$GITHUB_REPOSITORY_OWNER" | tr '[:upper:]' '[:lower:]')

echo "Construyendo imagen Docker..."
docker build -t ghcr.io/$REPO_LOWER/transaction-validator:latest .
docker push ghcr.io/$REPO_LOWER/transaction-validator:latest
