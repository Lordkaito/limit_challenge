# Submission Tracker

A workspace for operations managers to review broker-submitted opportunities. Browse incoming submissions, filter by business context, and inspect full details per record.

**Stack:** Django 5 + Django REST Framework · Next.js 16 + React 19 · Material UI v7 · TanStack Query v5

---

## Quick start

See [`SETUP.md`](./SETUP.md) for full instructions. Short version:

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && python manage.py migrate
python manage.py seed_submissions && python manage.py runserver 0.0.0.0:8000

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Visit `http://localhost:3000/submissions`.

---

## Project structure

```
backend/
  server/                  Django project (settings, urls)
  submissions/
    models.py              Domain models
    serializers.py         List and detail serializers
    views.py               ReadOnly viewsets
    filters/submission.py  All filter logic
    pagination.py          Custom pagination with totalPages
    tests/                 52 backend tests
    management/commands/   seed_submissions, seed_e2e_submissions
frontend/
  app/
    submissions/page.tsx          List page
    submissions/[id]/page.tsx     Detail page
    providers.tsx                 MUI theme, React Query, Toast context
  components/
    common/                StatusChip, PriorityChip
    submissions/list/      SubmissionTable, SubmissionCard, SubmissionFilters,
                           SubmissionPagination, LoadingState, EmptyState, ErrorState
    submissions/detail/    ContactsSection, DocumentsSection, NotesSection, DetailSkeleton
  lib/
    hooks/                 useSubmissions, useBrokerOptions, useSubmissionFilters, useDebounce
    utils/                 formatters.ts, params.ts
    types.ts
  e2e/                     Playwright tests
```

---

## Backend

### API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/submissions/` | Paginated list with filters |
| GET | `/api/submissions/<id>/` | Full detail with contacts, documents, notes |
| GET | `/api/brokers/` | Flat array for dropdown (unpaginated) |

### Filtering

All filters are composed with AND logic via `django-filter`. The list endpoint supports:

| Param | Type | Behavior |
|-------|------|----------|
| `status` | string | Case-insensitive exact match |
| `priority` | string | Case-insensitive exact match |
| `brokerId` | integer | FK lookup |
| `companySearch` | string | `icontains` across legal name, industry, and city |
| `search` | string | Full-text across company name, broker name, and summary |
| `createdFrom` | date | Inclusive lower bound on `created_at` |
| `createdTo` | date | Inclusive upper bound on `created_at` |
| `hasDocuments` | boolean | Presence filter |
| `hasNotes` | boolean | Presence filter |
| `ordering` | string | Sort by `created_at`, `status`, or `priority` (prefix `-` for descending) |
| `page` / `pageSize` | integer | Pagination (default 10, max 100) |

**Boolean filters use `Exists()` subqueries** instead of `JOIN + distinct()`. A join-based approach multiplies rows when a submission has many documents, requiring `distinct()` to deduplicate — which is slower and semantically fragile. `Exists()` short-circuits as soon as one related row is found and never inflates the queryset.

**Date range validation** is enforced both on the server (returns 400 if `createdFrom > createdTo`) and visually in the UI (warning alert, no silent bad request).

### Query optimization

The viewset uses action-conditional querysets to avoid over-fetching:

**List action** — needs counts and a note preview, not full related objects:
- `select_related('broker', 'company', 'owner')` — eliminates N+1 on FK fields
- `Count('documents', distinct=True)` and `Count('notes', distinct=True)` — annotated counts
- Three `Subquery` annotations pulling `author_name`, `body`, and `created_at` from the latest note — avoids fetching all notes just for a preview

**Retrieve action** — needs full related data:
- Same `select_related` base
- `Prefetch('contacts', queryset=Contact.objects.order_by('name'))` 
- `Prefetch('documents', queryset=Document.objects.order_by('-uploaded_at'))`
- `Prefetch('notes', queryset=Note.objects.order_by('-created_at'))`

Ordering is explicit on every `Prefetch` — without it, related objects arrive in an undefined order that varies by database.

**`BrokerViewSet`** sets `pagination_class = None` explicitly, returning a flat array the frontend dropdown can consume directly. Without this, it would inherit the global pagination class and return a `{count, results}` envelope instead.

### Pagination

A custom `SubmissionPagination` class extends DRF's `PageNumberPagination` to include `totalPages` in the response. Computing this client-side is error-prone (off-by-one on the ceiling division, edge cases at zero). Returning it from the server means the frontend just reads a number.

### Serializers

Two serializers share no logic:

- `SubmissionListSerializer` — flat fields + annotated counts + `get_latest_note` method field. The method field reads annotation attributes set by the viewset (`latest_note_author`, `latest_note_body`, `latest_note_created_at`) and returns `null` when no notes exist.
- `SubmissionDetailSerializer` — same FK fields + nested `contacts`, `documents`, and `notes` arrays.

`djangorestframework-camel-case` handles snake_case → camelCase conversion at the renderer layer, so serializer fields stay Pythonic and the frontend receives idiomatic JavaScript keys.

### Settings

All secrets and environment-specific values come from environment variables — no hardcoded `SECRET_KEY`, no `CORS_ALLOW_ALL_ORIGINS = True`. Defaults are safe for local development. See `.env.example` for the full list.

---

## Frontend

### Filter state lives in the URL

Every filter is stored as a URL query parameter. This is the most important architectural decision in the frontend — it means:

- Links are bookmarkable and shareable
- Browser back/forward restores the exact filter state
- Refreshing the page doesn't lose the current view
- Navigating to a detail page and returning lands back on the same filtered list

Implementation: `useSubmissionFilters` reads all params from `useSearchParams()` into a memoized `filters` object and writes changes back with `router.replace()`. The `page` param is reset automatically whenever any other filter changes, preventing stale pagination.

**Company search and general search** are the exceptions: each input field holds local draft state so it feels responsive while typing. A 300ms `useDebounce` hook delays the URL write (and therefore the API call) until the user pauses.

### Data fetching

TanStack Query manages all server state:

- `useSubmissionsList(filters)` — query key includes the full filters object, so every unique combination of params gets its own cache entry. `staleTime: 30s` avoids redundant refetches when switching between pages. `placeholderData: (prev) => prev` keeps the previous page's data visible while the next page loads, eliminating the skeleton flash that would otherwise appear on every pagination click.
- `useSubmissionDetail(id)` — `staleTime: 60s`, only enabled when an `id` is present.
- `useBrokerOptions()` — `staleTime: 5min`, brokers change rarely.

`buildParams` strips `undefined`, `null`, and empty strings before building the axios request, preventing spurious `?status=&brokerId=` params from reaching the API.

### Component structure

**List page** renders differently at the `md` breakpoint:
- Desktop: `SubmissionTable` — a full MUI `Table` with 9 columns. Rows are keyboard navigable (Enter/Space trigger navigation). Sortable columns (Status, Priority, Created) use `TableSortLabel` and write `?ordering=` to the URL.
- Mobile: a stack of `SubmissionCard` components — compact cards with the same data in a touch-friendly layout.

Both click/tap handlers append the current query string to the detail URL so the back button restores filters.

**Detail page** is composed of independent section components (`ContactsSection`, `DocumentsSection`, `NotesSection`), each responsible for its own empty state. The back button reconstructs the list URL from the detail page's own `useSearchParams()`, preserving filters even if the user refreshes on the detail page.

**Loading states** use MUI `Skeleton` components shaped to match the real content — table rows with the right column widths, card-shaped blocks for the detail sections. There is no "Loading..." text anywhere.

**Empty states** distinguish two cases: no data at all ("No submissions yet") vs. filters that returned nothing ("No matches — clear filters"). These are meaningfully different messages for the user.

**Error states** always include a Retry button that calls `refetch()`. Route-level error boundaries (`error.tsx`) catch rendering errors with the same pattern.

### Single source of truth for status and priority

`lib/utils/formatters.ts` owns `STATUS_META` and `PRIORITY_META` — maps from status/priority values to display labels and MUI chip colors. `StatusChip` and `PriorityChip` import from there. Nothing else defines these mappings. This prevents the common mistake of duplicating color logic across the list and detail pages that then drift out of sync.

---

## Testing

### Backend — 52 tests

Organized into three files under `submissions/tests/`:

- `test_views.py` — list shape (all fields, camelCase), annotation correctness (document count, note count, latest note), detail ordering (contacts alphabetical, documents/notes newest-first), 404 on missing ID, broker flat array
- `test_filters.py` — all 9 filters individually, filter combinations, date range 400, page size param
- `test_serializers.py` — serializer field defaults and null handling

Run: `make test-backend`

### Frontend — 32 unit tests

Six test files using Jest + React Testing Library:

- `params.test.ts` — `buildParams` strips undefined/null/empty, converts types to strings
- `formatters.test.ts` — STATUS_META and PRIORITY_META completeness, relative date formatting
- `StatusChip.test.tsx` — all four statuses render the correct label
- `PriorityChip.test.tsx` — all three priorities render the correct label
- `EmptyState.test.tsx` — correct message per state, clear button fires callback
- `useDebounce.test.ts` — initial value returned immediately, delay enforced, timer resets on rapid input, works with non-string types

Run: `make test-frontend`

### E2E — 9 Playwright tests

Uses a deterministic seed (`seed_e2e_submissions`) with 3 fixed submissions so assertions are stable:

- List page loads and shows all 3 companies
- Status filter updates URL and hides non-matching rows
- Priority filter updates URL
- Company search debounces and syncs to URL
- Clear all resets URL and restores full list
- Row click navigates to detail
- Detail page shows all sections for a data-rich submission
- Back button preserves filter params in URL
- Empty states shown for a submission with no contacts/documents/notes

Run (requires both servers running with E2E data):
```bash
make seed-e2e
cd frontend && npm run test:e2e
```

---

## Extras

### Docker Compose + GitHub Actions CI

`docker-compose.yml` orchestrates both services. `.github/workflows/ci.yml` runs backend tests and frontend typecheck + lint + unit tests on every push and pull request.

### Makefile

Shortcuts for every common task. See `SETUP.md` for the full table.

### Deterministic seed

The main seed uses `Faker.seed(42)` so the generated dataset is reproducible across machines. A separate `seed_e2e_submissions` command creates a minimal, fully hardcoded 3-submission dataset for Playwright tests — no Faker, no randomness, every field is a known constant.

### ReactQueryDevtools

Included with `initialIsOpen=false`. Open via the floating button in the bottom corner to inspect cache entries, query states, and refetch behavior while reviewing.

### Toast notifications

A `ToastContext` in `providers.tsx` exposes a `useToast()` hook that any component can call to surface an error Snackbar. Anchored bottom-right, auto-hides after 5 seconds.

### Column sorting

Clicking the Status, Priority, or Created column headers sets `?ordering=` in the URL. A second click on the same column toggles direction. The backend `OrderingFilter` handles the rest.

### Configurable page size

The pagination footer includes a rows-per-page selector (10 / 20 / 50). Changing it resets to page 1 and updates `?pageSize=` in the URL.
