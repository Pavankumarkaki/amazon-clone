#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${K8S_NAMESPACE:-amazon-clone}"
IMAGE="${ACR_NAME}.azurecr.io/amazon-clone-backend:${IMAGE_TAG}"

echo "Running database migrations with ${IMAGE}"
kubectl delete job backend-migrate -n "${NAMESPACE}" --ignore-not-found=true
sed "s|image: .*amazon-clone-backend:.*|image: ${IMAGE}|" k8s/backend-migration-job.yaml | kubectl apply -f -
kubectl wait -n "${NAMESPACE}" --for=condition=complete job/backend-migrate --timeout=300s

echo "Rolling out backend deployment with ${IMAGE}"
kubectl set image deployment/backend backend="${IMAGE}" -n "${NAMESPACE}"
kubectl rollout status deployment/backend -n "${NAMESPACE}" --timeout=300s
