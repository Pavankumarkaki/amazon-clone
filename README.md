# Amazon Clone

A production-grade full-stack e-commerce application modeled after Amazon.in. Built as an SDE Fullstack assignment with a layered backend, Amazon-inspired frontend, and deployable infrastructure from local Docker Compose through Azure AKS.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, ShadCN-style UI primitives, Zustand, TanStack Query, React Hook Form + Zod, Embla Carousel, Sonner toasts, Vitest |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), PostgreSQL 16, Alembic, Pydantic v2, python-jose (JWT), passlib/bcrypt, fastapi-mail |
| **Auth** | JWT access token (localStorage) + httpOnly refresh cookie |
| **Local infra** | Docker Compose (PostgreSQL only) |
| **Production infra** | Azure AKS + ACR, NGINX Ingress, cert-manager (TLS); optional Vercel + Render + Neon |

## Features

### Storefront
- **Home page** — hero banner, “Shop by Category” grid with category images, “Today’s Deals” product grid
- **Product listing** — search, category filter, pagination, sort (`newest`, `price_asc`, `price_desc`)
- **Product detail** — image gallery/carousel, price/MRP/discount, stock badge, buy box, specs table, features, related products, customer reviews section, mobile sticky buy bar
- **Responsive layout** — Amazon-style navbar, sub-navigation, footer, cart drawer

### Cart & Checkout
- **Guest cart** — persisted in `localStorage` via Zustand
- **Authenticated cart** — synced to PostgreSQL via REST API; guest cart merges on login/register
- **Cart validation** — server-side stock and price check before checkout
- **Checkout** — shipping form, order placement, confirmation email (SMTP or console in dev)

### User Accounts
- Register, login, logout, token refresh
- Account dropdown in navbar
- Order history and order detail pages
- Wishlist (add/remove, dedicated page)

### Data & Pricing
- Prices stored as **integer cents** (no floating-point errors)
- Products seeded from [DummyJSON](https://dummyjson.com) with INR conversion, 10 categories, enriched specs/features, ratings, and MRP/discount fields
- Demo user pre-seeded for testing

## Architecture

### Backend (layered)

```
HTTP Request
    │
    ▼
api/v1/*.py          Route handlers (FastAPI routers)
    │
    ▼
services/*.py        Business logic (orders, cart, auth, wishlist)
    │
    ▼
repositories/*.py    Data access (SQLAlchemy queries)
    │
    ▼
models/*.py          ORM entities
    │
    ▼
PostgreSQL
```

### Frontend (state split)

| Concern | Tool | Examples |
|---------|------|----------|
| Server state | TanStack Query | products, categories, orders, wishlist, server cart |
| Client state | Zustand | guest cart, auth user, UI (drawer) |
| Forms | React Hook Form + Zod | checkout, login, register |
| Styling | Tailwind CSS 4 + design tokens | colors, spacing, typography in `src/design-tokens/` |

### Deployment (AKS)

```
Internet → NGINX Ingress (/api → backend, / → frontend)
              ├── Frontend (Next.js standalone, :3000)
              ├── Backend (FastAPI, :8000)
              └── PostgreSQL (StatefulSet, :5432)
```

See [k8s/README.md](k8s/README.md) for full Azure AKS setup, TLS, and production notes.

## Project Structure

```
amazon-clone/
├── .github/
│   ├── workflows/
│   │   └── azure-aks-deploy.yml   # CI: build → ACR → deploy to AKS
│   └── scripts/
│       ├── deploy-backend.sh
│       └── deploy-frontend.sh
├── backend/
│   ├── alembic/                   # Database migrations
│   │   └── versions/
│   │       ├── 001_initial_schema.py
│   │       └── 002_cart_wishlist_product_enhancements.py
│   ├── app/
│   │   ├── api/v1/                # REST route handlers
│   │   │   ├── auth.py
│   │   │   ├── cart.py
│   │   │   ├── categories.py
│   │   │   ├── orders.py
│   │   │   ├── products.py
│   │   │   ├── wishlist.py
│   │   │   └── router.py
│   │   ├── core/                  # Config, DB session, security, deps
│   │   ├── models/                # SQLAlchemy ORM
│   │   ├── schemas/               # Pydantic request/response DTOs
│   │   ├── services/              # Business logic
│   │   ├── repositories/          # Data access layer
│   │   ├── utils/                 # Seed script, email helper
│   │   └── main.py                # FastAPI app factory
│   ├── tests/                     # pytest + httpx async client
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── public/                    # Static assets (banners, logos)
│   └── src/
│       ├── app/                   # Next.js App Router pages
│       │   ├── page.tsx           # Home / product listing
│       │   ├── products/[id]/     # Product detail
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── login/ & register/
│       │   ├── orders/ & orders/[id]/
│       │   ├── wishlist/
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── cart/              # CartItemRow, CartSummary
│       │   ├── home/              # HeroBanner, HomeSection
│       │   ├── layout/            # Navbar, SubNav, Footer, CartDrawer, AccountDropdown
│       │   ├── product/           # ProductCard, SearchBar, pagination, detail sections
│       │   └── ui/                # button, input, card, carousel, skeleton, etc.
│       ├── design-tokens/         # colors, spacing, typography, shadows, borderRadius
│       ├── hooks/                 # TanStack Query hooks (useProducts, useCart, …)
│       ├── lib/                   # apiClient, pagination, queryKeys, productPricing
│       ├── providers/             # QueryProvider, AuthProvider
│       ├── store/                 # Zustand: auth, cart, ui
│       └── types/                 # Shared TypeScript interfaces
│   ├── Dockerfile                 # Multi-stage Next.js standalone build
│   └── package.json
├── k8s/                           # Kubernetes manifests (AKS)
├── .cursor/skills/                # Cursor agent skills (Tailwind/design)
├── docker-compose.yml             # Local PostgreSQL
├── Makefile                       # Common dev commands
├── .env.example                   # Root env reference
└── README.md
```

## Database Models

| Model | Purpose |
|-------|---------|
| `User` | Email/password auth, full name |
| `Category` | Name + URL slug |
| `Product` | Title, brand, description, specs (JSONB), features (JSONB), price/MRP in cents, discount %, rating, reviews, stock |
| `ProductImage` | Multiple images per product with sort order |
| `Cart` / `CartItem` | Per-user server-side cart |
| `Order` / `OrderItem` | Placed orders with status enum |
| `Wishlist` / `WishlistItem` | Per-user saved products |

## API Endpoints

Base URL: `/api/v1` · Interactive docs: `http://localhost:8000/docs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Health check (root, not under `/api/v1`) |
| **Products** |
| GET | `/products` | — | List products (`search`, `category`, `page`, `page_size`, `sort`) |
| GET | `/products/{id}` | — | Product detail |
| **Categories** |
| GET | `/categories` | — | List all categories |
| **Cart** |
| GET | `/cart` | ✓ | Get authenticated user's cart |
| POST | `/cart/items` | ✓ | Add item |
| PATCH | `/cart/items/{id}` | ✓ | Update quantity |
| DELETE | `/cart/items/{id}` | ✓ | Remove item |
| DELETE | `/cart` | ✓ | Clear cart |
| POST | `/cart/validate` | — | Validate cart lines (stock/price) |
| **Orders** |
| POST | `/orders` | ✓ | Place order |
| GET | `/orders` | ✓ | Order history |
| GET | `/orders/{id}` | ✓ | Order detail |
| **Auth** |
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login (returns access token, sets refresh cookie) |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/logout` | — | Clear refresh cookie |
| GET | `/auth/me` | ✓ | Current user profile |
| **Wishlist** |
| GET | `/wishlist` | ✓ | List wishlist items |
| POST | `/wishlist` | ✓ | Add by product ID (body) |
| POST | `/wishlist/{product_id}` | ✓ | Add by path param |
| DELETE | `/wishlist/{product_id}` | ✓ | Remove item |

## Frontend Routes

| Route | Page |
|-------|------|
| `/` | Home — hero, categories, product grid with search/filter/pagination |
| `/products/[id]` | Product detail |
| `/cart` | Full cart page |
| `/checkout` | Checkout flow |
| `/login` | Sign in |
| `/register` | Create account |
| `/orders` | Order history |
| `/orders/[id]` | Single order detail |
| `/wishlist` | Saved items |

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Async PostgreSQL URL (`postgresql+asyncpg://…`) |
| `SECRET_KEY` | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL (default 30) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh cookie TTL (default 7) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `MAIL_*` | SMTP settings (optional; logs to console when empty) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base (default `http://localhost:8000/api/v1`) |

In Docker/K8s builds, frontend uses `NEXT_PUBLIC_API_URL=/api/v1` so the ingress can proxy `/api` to the backend.

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### Option A — Makefile (recommended)

```bash
# Terminal 1: database + migrations + seed
make dev

# Terminal 2: backend
make backend-install   # first time only
make backend-dev

# Terminal 3: frontend
make frontend-install  # first time only
make frontend-dev
```

### Option B — Manual setup

**1. Start PostgreSQL**

```bash
docker compose up -d
```

**2. Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m app.utils.seed
uvicorn app.main:app --reload --port 8000
```

**3. Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| API docs | http://localhost:8000/docs |
| Health | http://localhost:8000/health |

### Demo Credentials

After seeding:

- **Email:** `demo@amazon-clone.com`
- **Password:** `demo123`

## Testing

```bash
# All tests (Makefile)
make test

# Backend only
cd backend && pytest

# Frontend only
cd frontend && npm run test
```

**Backend tests** (`backend/tests/`):

- `test_api.py` — health, products list, categories
- `test_cart_service.py` — cart validation (empty cart, missing product, stock checks)

**Frontend tests** (`frontend/src/store/cart.store.test.ts`) — guest cart Zustand store logic.

## Docker Images

```bash
make docker-build              # both images
make docker-build-backend
make docker-build-frontend
```

- **Backend:** Python 3.11 slim, uvicorn on port 8000
- **Frontend:** Node 20 Alpine multi-stage, Next.js standalone on port 3000

## Deployment

### Local / Demo

| Component | Command |
|-----------|---------|
| Database | `docker compose up -d` |
| Backend | `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| Frontend | `npm run build && npm start` |

### Azure AKS (primary production path)

1. Provision ACR + AKS + NGINX Ingress ([k8s/README.md](k8s/README.md))
2. Build and push images to ACR
3. Create Kubernetes secrets (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, …)
4. Apply manifests in `k8s/`
5. Run migration and seed jobs
6. Optional: cert-manager for HTTPS

**CI/CD:** Pushes to `main` that touch `backend/`, `frontend/`, or k8s manifests trigger [.github/workflows/azure-aks-deploy.yml](.github/workflows/azure-aks-deploy.yml) — path-filtered build to ACR, gated deploy to AKS (`publish` and `production` GitHub environments).

### Alternative: Vercel + Render + Neon

| Service | Role |
|---------|------|
| [Neon](https://neon.tech) | Managed PostgreSQL |
| Render / Railway | FastAPI backend (`alembic upgrade head` pre-deploy) |
| Vercel | Next.js frontend |

Backend env: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`  
Frontend env: `NEXT_PUBLIC_API_URL=https://your-api.example.com/api/v1`

## Design System

The frontend mirrors Amazon.in styling via:

- CSS variables in `globals.css` (e.g. `--color-text-primary`, `--container-max`)
- TypeScript design tokens in `frontend/src/design-tokens/`
- Cursor skill at `.cursor/skills/designing-and-tailwind/` for consistent Tailwind patterns

## Key Implementation Notes

- **Cart duality:** Guests use Zustand + `localStorage`; logged-in users use the server cart API. On login, `mergeGuestCartToServer()` syncs guest items.
- **Order safety:** Checkout calls `/cart/validate` to re-check stock and prices server-side before creating an order.
- **Seed data:** `python -m app.utils.seed` fetches products from DummyJSON, maps categories, converts USD→INR, and creates a demo user. Requires network on first run.
- **Query cache:** TanStack Query keys centralized in `frontend/src/lib/queryKeys.ts`; a shared query client registry supports auth/cart invalidation outside React components.

## License

Built for educational / assignment purposes.
