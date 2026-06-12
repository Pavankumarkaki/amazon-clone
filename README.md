# Amazon Clone

A production-grade full-stack e-commerce application built for an SDE Fullstack assignment.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, ShadCN UI, Zustand, TanStack Query |
| Backend | FastAPI, SQLAlchemy 2.0, PostgreSQL, Alembic |
| Auth | JWT (access token + httpOnly refresh cookie) |
| Infra | Docker Compose (local), Vercel + Render + Neon (production) |

## Features

### Core
- Product listing with search and category filter
- Product detail with image carousel, specs, stock status
- Shopping cart (persisted in localStorage)
- Checkout with shipping form and order confirmation

### Bonus
- User authentication (register/login)
- Order history
- Wishlist
- Order confirmation email (console mode in dev)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### 1. Start Database

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Run migrations
alembic upgrade head

# Seed sample data (20 products, 5 categories, demo user)
python -m app.utils.seed

# Start API server
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App: http://localhost:3000

### Demo Credentials
- Email: `demo@amazon-clone.com`
- Password: `demo123`

## Project Structure

```
amazon-clone/
├── backend/
│   ├── app/
│   │   ├── api/v1/        # Route handlers
│   │   ├── core/          # Config, DB, security, deps
│   │   ├── models/        # SQLAlchemy ORM
│   │   ├── schemas/       # Pydantic DTOs
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access
│   │   └── utils/         # Seed, email
│   ├── alembic/           # Migrations
│   └── tests/
├── frontend/
│   └── src/
│       ├── app/           # Next.js pages
│       ├── components/    # UI components
│       ├── hooks/         # TanStack Query hooks
│       ├── store/         # Zustand stores
│       ├── lib/           # API client, utils
│       └── types/         # TypeScript types
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (search, filter, paginate) |
| GET | `/api/v1/products/{id}` | Product detail |
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/cart/validate` | Validate cart items |
| POST | `/api/v1/orders` | Place order |
| GET | `/api/v1/orders` | Order history (auth) |
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/wishlist` | Wishlist (auth) |

## Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run test
```

## Deployment

### Database (Neon)
1. Create a free PostgreSQL database at [neon.tech](https://neon.tech)
2. Copy the connection string

### Backend (Render / Railway)
1. Connect your repo, set root directory to `backend`
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Pre-deploy: `alembic upgrade head`
5. Env vars: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`

### Frontend (Vercel)
1. Import repo, set root directory to `frontend`
2. Env var: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1`

## Architecture

```
Router → Service → Repository → Database
```

- **Server state**: TanStack Query (products, orders, wishlist)
- **Client state**: Zustand (cart, auth, UI)
- **Price storage**: Integer cents (no float errors)
- **Order validation**: Server-side stock/price check at checkout
