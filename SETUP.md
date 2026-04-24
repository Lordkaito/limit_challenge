# Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions
python manage.py runserver 0.0.0.0:8000
```

## Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000/submissions`.

## Environment variables

The project runs with safe defaults out of the box. To override:

```bash
cp .env.example .env
# edit .env — at minimum set a real SECRET_KEY for production
```

## Make commands (after venv is active)

The Makefile shortcuts assume the virtualenv is already activated in your shell.

| Command | What it does |
|---|---|
| `make setup` | Install deps, migrate, seed, npm install |
| `make dev-backend` | Start Django on port 8000 |
| `make dev-frontend` | Start Next.js on port 3000 |
| `make seed` | Rebuild seed data (25 submissions) |
| `make test-backend` | Run 41 backend tests |
| `make test-frontend` | Run 27 frontend unit tests |
| `make seed-e2e` | Load deterministic E2E dataset (3 submissions) |

## Docker Compose (alternative)

```bash
cp .env.example .env
docker compose up
```

## E2E tests

Requires both servers running with the E2E dataset:

```bash
make seed-e2e
cd frontend && npm run test:e2e
```
