#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${K8S_NAMESPACE:-amazon-clone}"
IMAGE="${ACR_NAME}.azurecr.io/amazon-clone-frontend:${IMAGE_TAG}"

echo "Rolling out frontend deployment with ${IMAGE}"
kubectl set image deployment/frontend frontend="${IMAGE}" -n "${NAMESPACE}"
kubectl rollout status deployment/frontend -n "${NAMESPACE}" --timeout=300s
