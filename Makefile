.PHONY: db-up db-down backend-install backend-migrate backend-seed backend-dev frontend-install frontend-dev dev test \
	docker-build-backend docker-build-frontend docker-build

db-up:
	docker compose up -d

db-down:
	docker compose down

backend-install:
	cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

backend-migrate:
	cd backend && . .venv/bin/activate && alembic upgrade head

backend-seed:
	cd backend && . .venv/bin/activate && python -m app.utils.seed

backend-dev:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

dev: db-up backend-migrate backend-seed
	@echo "Run 'make backend-dev' and 'make frontend-dev' in separate terminals"

test:
	cd backend && . .venv/bin/activate && pytest
	cd frontend && npm run test

docker-build-backend:
	docker build -t amazon-clone-backend ./backend

docker-tag-backend:
	docker tag amazon-clone-backend amazonclonepavan123.azurecr.io/amazon-clone-backend:latest

docker-push-backend:
	docker push amazonclonepavan123.azurecr.io/amazon-clone-backend:latest

docker-build-frontend:
	docker build --build-arg NEXT_PUBLIC_API_URL=/api/v1 -t amazon-clone-frontend ./frontend

docker-build: docker-build-backend docker-build-frontend
