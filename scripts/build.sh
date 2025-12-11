#!/bin/bash
set -e

echo "Construyendo imagen Docker..."
docker build -t ghcr.io/$GITHUB_REPOSITORY_OWNER/transaction-validator:latest .
docker push ghcr.io/$GITHUB_REPOSITORY_OWNER/transaction-validator:latest
