## Implementation Notes

### Approach

- **URL-driven filter state**: all 8 filters live in URL params via `useSearchParams` + `router.replace`. Links are bookmarkable and shareable. Browser back/forward and history restore filter state correctly.
- **300ms debounced company search**: local draft state keeps the input responsive while API calls batch after the user stops typing.
- **Backend query efficiency**: `select_related('broker', 'company', 'owner')` on every action. Action-conditional `prefetch_related` with ordered `Prefetch()` on retrieve. `Exists()` subqueries for boolean filters (no join row multiplication from `distinct()`). Single `Subquery` per annotation for latest note preview.
- **Single formatter source**: `lib/utils/formatters.ts` owns all status/priority labels and chip colors — imported everywhere, never duplicated across list and detail.
- **`placeholderData`**: list query retains previous results during filter/pagination changes — no table flash or skeleton re-renders on every page turn.
- **Stable pagination**: `-id` tiebreak on default ordering prevents duplicate rows when timestamps tie. `totalPages` computed server-side to avoid client-side off-by-one.

### Tradeoffs

- **Eager prefetch on detail** (contacts + documents + notes in one request) vs. lazy section loading. Chosen for simplicity; typical submission sizes don't need streaming. Could add section-level loading for very large note threads.
- **SQLite for development** — zero infrastructure. Swap `DATABASES` in settings for PostgreSQL in production.
- **No authentication** — read-only API fits the ops review use case. Would add DRF token auth + Next.js middleware for production.

### Running the project

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions        # 25 seeded submissions
python manage.py runserver 0.0.0.0:8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000/submissions`.

**With Docker Compose**

```bash
cp .env.example .env   # edit SECRET_KEY
docker compose up
```

**Running tests**

```bash
# Backend (41 tests)
cd backend && python manage.py test submissions.tests -v 2

# Frontend unit tests (27 tests)
cd frontend && npm test

# E2E tests (requires running app + E2E seed)
cd backend && python manage.py seed_e2e_submissions --force
cd frontend && npm run test:e2e
```

### Extras implemented

- [x] All optional filters: `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes`
- [x] Priority filter + full-text `search` filter (spans company name, broker name, summary)
- [x] Date range validation — client-side warning alert + server-side 400 rejection
- [x] Responsive layout: table on desktop (md+), card grid on mobile
- [x] MUI Skeleton loaders everywhere — no "Loading..." text
- [x] Distinct empty states: "No submissions yet" vs "No matches for active filters"
- [x] Relative dates ("Today", "Yesterday", "3d ago") with full datetime tooltip on hover
- [x] Keyboard navigation on table rows (Enter/Space)
- [x] `aria-label` on all 8 filter inputs
- [x] `rel="noopener noreferrer"` on external document links
- [x] Active filter indicator + "Clear all filters" button
- [x] Back link on detail page restores full filter query string from URL
- [x] `-id` tiebreak on default ordering for stable pagination
- [x] `totalPages` returned by server (no client-side computation)
- [x] `pagination_class = None` explicit on `BrokerViewSet` (flat array for dropdown)
- [x] Env-var driven settings — no hardcoded `SECRET_KEY` or `CORS_ALLOW_ALL_ORIGINS`
- [x] `Exists()` subqueries for boolean filters (not `join + distinct()`)
- [x] Deterministic `Faker.seed(42)` in main seed command
- [x] Deterministic `seed_e2e_submissions` command for Playwright tests
- [x] 41 backend tests + 27 frontend unit tests
- [x] Playwright E2E test suite (filter flow, detail navigation, back button, empty states)
- [x] Column sort UI (Status, Priority, Created) via `?ordering=` param
- [x] Configurable page size (10 / 20 / 50 rows)
- [x] Docker Compose + GitHub Actions CI
- [x] Makefile with `setup`, `dev-backend`, `dev-frontend`, `test-backend`, `test-frontend`, `seed`, `seed-e2e`
- [x] `ReactQueryDevtools` (initialIsOpen=false) for reviewer inspection
- [x] Toast context + Snackbar for global error notifications

---

# Submission Tracker Take-home Challenge

This repository hosts the boilerplate for the Submission Tracker assignment. It includes a Django +
Django REST Framework backend and a Next.js frontend scaffold so candidates can focus on API
design, relational data modelling, and product-focused UI work.

## Challenge Overview

Operations managers need a workspace to review broker-submitted opportunities. Build a lightweight
tool that lets them browse incoming submissions, filter by business context, and inspect full
details per record. Deliver a polished frontend experience backed by clean APIs.

### Goals

- **Backend:** Model the domain, expose list and detail endpoints, and support realistic filtering.
- **Frontend (higher weight):** Craft an intuitive list and detail experience with filters that map
  to query parameters. Focus on UX clarity, organization, and maintainability.

## Data Model

Required entities (already defined in `submissions/models.py`):

- `Broker`: name, contact email
- `Company`: legal name, industry, headquarters city
- `TeamMember`: internal owner for a submission
- `Submission`: links to company, broker, owner with status, priority, and summary
- `Contact`: primary contacts for a submission
- `Document`: references to supporting files
- `Note`: threaded context for collaboration

Seed data (~25 submissions with dozens of related contacts, documents, and notes) is available via
`python manage.py seed_submissions`. Re-run with `--force` to rebuild the dataset.

## API Requirements

- `GET /api/submissions/`
  - Returns paginated submissions with company, broker, owner, counts of related documents/notes,
    and the latest note preview.
  - Supports filters via query params. `status` is wired up; extend filters for `brokerId` and
    `companySearch` (plus optional extras like `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes`).
- `GET /api/submissions/<id>/`
  - Returns the full submission plus related contacts, documents, and notes.
- `GET /api/brokers/`
  - Returns brokers for the frontend dropdown.

Viewsets, serializers, and base filters are in place but intentionally minimal so you can refine
the query behavior and filtering logic.

## Frontend Workspace Overview

The Next.js 16 + React 19 app in `frontend/` is pre-wired for this challenge. Material UI handles
layout, axios powers HTTP requests, and `@tanstack/react-query` is ready for data fetching. The list
and detail routes under `/submissions` are scaffolded so you can focus on API consumption and UX
polish.

### What is pre-built?

- Global providers supply Material UI theming and a shared React Query client.
- `/submissions` hosts the list view with filter inputs and hints about required query params.
- `/submissions/[id]` hosts the detail shell and links back to the list.
- Custom hooks in `lib/hooks` define how to fetch submissions and brokers. Each hook is disabled by
  default (`enabled: false`) so no network requests fire until you enable them.

### What you need to implement

- Wire the filter state to query parameters and React Query `queryFn`s.
- Render table/card layouts for the submission list along with loading, empty, and error states.
- Build the detail page sections for summary data, contacts, documents, and notes.
- Enable the queries and handle pagination or other UX you want to highlight.

## Project Structure

- `backend/`: Django project with REST API, seed command, and submission models.
- `frontend/`: Next.js app described above.
- `INTERVIEWER_NOTES.md`: Context for reviewers/interviewers.

## Environment Variables

- Frontend requests default to `http://localhost:8000/api`. Override this by creating
  `frontend/.env.local` and setting `NEXT_PUBLIC_API_BASE_URL`.

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions  # optional but recommended
# add --force to rebuild the generated sample data
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # create if you want a custom API base
# NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api
npm run dev
```

Visit `http://localhost:3000/submissions` to start building.

## Development Workflow

1. Start the Django server on port 8000 (`python manage.py runserver`).
2. Start the Next.js dev server on port 3000 (`npm run dev`).
3. Iterate on backend filters, serializers, and viewsets, then refresh the frontend to see updated
   data.
4. When ready, add README notes summarizing your approach, tradeoffs, and any stretch goals.

## Submission Instructions

- Provide a short README update summarizing approach, tradeoffs, and how to run the solution.
- Record and share a brief screen capture (max 2 minutes) demonstrating the frontend working end-to-end with the backend.
- Call out any stretch goals implemented.
- Automated tests are optional, but including targeted backend or frontend tests is a strong signal.

## Evaluation Rubric

- **Frontend (45%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Backend (30%)** – API design, serialization choices, filtering implementation, and attention to
  relational data handling.
- **Code Quality (15%)** – Structure, naming, documentation/readability, testing where it adds
  value.
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details.

## Optional Bonus

Authentication, deployment, or extra tooling are not required but welcome if scope allows.
