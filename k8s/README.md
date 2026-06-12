# Kubernetes Deployment (Azure AKS)

Deploy the full stack (PostgreSQL, FastAPI backend, Next.js frontend) to Azure Kubernetes Service.

## Architecture

```
Internet
    │
    ▼
┌─────────────────┐
│  NGINX Ingress  │
│  /api → backend │
│  /    → frontend│
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│Frontend│ │ Backend  │
│ :3000  │ │  :8000   │
└────────┘ └────┬─────┘
                │
                ▼
          ┌──────────┐
          │ Postgres │
          │  :5432   │
          └──────────┘
```

## Prerequisites

- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (`az login`)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/get-docker/)
- An active Azure subscription

## Step-by-Step Deploy

### 1. Create Azure infrastructure

```bash
export RESOURCE_GROUP=amazon-clone-rg
export LOCATION=eastus
export ACR_NAME=youruniqueacrname   # globally unique, lowercase
export AKS_NAME=amazon-clone-aks

az group create --name $RESOURCE_GROUP --location $LOCATION

az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --attach-acr $ACR_NAME \
  --generate-ssh-keys

az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_NAME

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s
```

### 2. Build and push Docker images

```bash
az acr login --name $ACR_NAME

docker build -t ${ACR_NAME}.azurecr.io/amazon-clone-backend:latest ./backend
docker push ${ACR_NAME}.azurecr.io/amazon-clone-backend:latest

docker build --build-arg NEXT_PUBLIC_API_URL=/api/v1 \
  -t ${ACR_NAME}.azurecr.io/amazon-clone-frontend:latest ./frontend
docker push ${ACR_NAME}.azurecr.io/amazon-clone-frontend:latest
```

### 3. Create secrets (never commit these)

```bash
export POSTGRES_PASSWORD=$(openssl rand -base64 24)
export SECRET_KEY=$(openssl rand -hex 32)
export APP_URL=http://localhost   # update after ingress gets an IP

kubectl create namespace amazon-clone

kubectl create secret generic amazon-clone-secrets \
  --namespace amazon-clone \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=DATABASE_URL="postgresql+asyncpg://amazon:${POSTGRES_PASSWORD}@postgres:5432/amazon_clone" \
  --from-literal=SECRET_KEY="$SECRET_KEY" \
  --from-literal=CORS_ORIGINS="$APP_URL" \
  --from-literal=MAIL_USERNAME="" \
  --from-literal=MAIL_PASSWORD=""
```

### 4. Apply manifests

Replace `ACR_NAME` in the YAML files, then apply:

```bash
for f in k8s/*.yaml; do
  sed "s/ACR_NAME/${ACR_NAME}/g" "$f" | kubectl apply -f -
done
```

### 5. Run migrations and seed

```bash
kubectl wait -n amazon-clone --for=condition=ready pod -l app=postgres --timeout=300s

kubectl apply -f <(sed "s/ACR_NAME/${ACR_NAME}/g" k8s/backend-migration-job.yaml)
kubectl wait -n amazon-clone --for=condition=complete job/backend-migrate --timeout=300s

kubectl apply -f <(sed "s/ACR_NAME/${ACR_NAME}/g" k8s/backend-seed-job.yaml)
```

### 6. Get your app URL

```bash
kubectl get ingress -n amazon-clone
```

Update CORS with the external IP:

```bash
export APP_URL=http://<EXTERNAL-IP>
kubectl create secret generic amazon-clone-secrets \
  --namespace amazon-clone \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=DATABASE_URL="postgresql+asyncpg://amazon:${POSTGRES_PASSWORD}@postgres:5432/amazon_clone" \
  --from-literal=SECRET_KEY="$SECRET_KEY" \
  --from-literal=CORS_ORIGINS="$APP_URL" \
  --from-literal=MAIL_USERNAME="" \
  --from-literal=MAIL_PASSWORD="" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl rollout restart deployment/backend -n amazon-clone
```

## Local Docker Build Test

```bash
make docker-build
```

## Files

| File | Purpose |
|------|---------|
| `namespace.yaml` | `amazon-clone` namespace |
| `configmap.yaml` | Non-sensitive config |
| `postgres-*.yaml` | PostgreSQL StatefulSet + PVC + Service |
| `backend-*.yaml` | FastAPI Deployment, Service, migration/seed Jobs |
| `frontend-*.yaml` | Next.js Deployment + Service |
| `ingress.yaml` | Routes `/api` to backend, `/` to frontend |

## Production Notes

- **Database**: The included PostgreSQL StatefulSet is suitable for demos. For production, use [Azure Database for PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql) and update `DATABASE_URL` in secrets.
- **HTTPS**: Add a TLS certificate via [cert-manager](https://cert-manager.io/) or Azure Key Vault.
- **Secrets**: Store secrets in [Azure Key Vault](https://azure.microsoft.com/en-us/products/key-vault) with the [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/).
- **Scaling**: Adjust `replicas` in deployment manifests or use HPA.

## Cleanup

```bash
kubectl delete namespace amazon-clone
az group delete --name $RESOURCE_GROUP --yes
```

## Demo Credentials

After seeding: `demo@amazon-clone.com` / `demo123`
