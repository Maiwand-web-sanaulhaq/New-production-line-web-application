# Production Line Planning Web Application

A professional full-stack web application for manufacturing production planning, demand forecasting, MRP explosion, and cost analysis. Built as a Next.js (TypeScript) + FastAPI monorepo.

## Repository Structure

```
├── backend/          # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Settings (env vars)
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # Product, BOMEntry ORM models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── routers/         # API route handlers
│   │   └── logic/           # Business logic (forecasting, planning, MRP, cost)
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # Next.js 14 + TypeScript + MUI v5
    ├── src/
    │   ├── app/             # Next.js App Router pages
    │   ├── components/      # Shared components (Layout, ThemeRegistry)
    │   └── lib/             # API client, MUI theme
    ├── package.json
    └── .env.example
```

## Features

| Page | Description |
|------|-------------|
| **About** | Project overview and technology stack |
| **Dashboard** | Summary stats (product count, BOM entries, avg lead time) |
| **Products** | CRUD table of all products |
| **Bill of Materials** | CRUD table of BOM entries with product filter |
| **Data Collection** | Manual product entry form + CSV bulk import |
| **Demand Forecast** | Weighted Moving Average demand forecast |
| **Production Planning** | L4L / EOQ / Fixed Period with capacity constraints |
| **MRP Explosion** | Component requirements from parent orders + BOM |
| **Cost Analysis** | Side-by-side cost comparison of all planning methods |

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (local or Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL URL

# Start the API server (tables are auto-created on startup)
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Start the dev server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### PostgreSQL with Docker

```bash
docker run -d \
  --name prodline-db \
  -e POSTGRES_DB=production_line \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:16-alpine
```

## Deployment

### Frontend — Vercel

1. Connect the repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` → your backend URL (e.g. `https://prodline-api.onrender.com`)
4. Deploy.

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. **Build command**: `pip install -r requirements.txt`
4. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `DATABASE_URL` → your PostgreSQL connection string
   - `CORS_ORIGINS` → comma-separated list of frontend URLs (e.g. `https://your-app.vercel.app`)

### Backend — Railway

1. Create a new project and add a **PostgreSQL** service.
2. Add a new service from the GitHub repo, pointing to the `backend` folder.
3. Set the same environment variables as above.

### Database

Both Render and Railway offer managed PostgreSQL. Copy the connection string into the `DATABASE_URL` environment variable. Tables are created automatically on first startup via `Base.metadata.create_all()`.

For production, consider using [Alembic](https://alembic.sqlalchemy.org/) migrations:

```bash
cd backend
alembic init alembic
# Configure alembic.ini with your DATABASE_URL
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/` | List all products |
| POST | `/products/` | Create a product |
| DELETE | `/products/{id}` | Delete a product |
| GET | `/bom/` | List BOM entries (optional `?product_id=`) |
| POST | `/bom/` | Create a BOM entry |
| DELETE | `/bom/{id}` | Delete a BOM entry |
| POST | `/forecast/` | Generate demand forecast |
| POST | `/planning/` | Run production plan (L4L/EOQ/FixedPeriod) |
| POST | `/mrp/` | Run MRP explosion |
| POST | `/cost/` | Run cost analysis |

Full interactive docs available at `/docs` when the backend is running.
