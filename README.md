# Support Ticket System

A support ticket app where users submit tickets, browse and filter them, and see live
statistics. When a user writes a description, an LLM suggests a **category** and
**priority**, which the user can accept or override before submitting.

**Stack:** Django + Django REST Framework + PostgreSQL, React (Vite), Google Gemini,
Docker Compose.

## Setup

Requirements: Docker Desktop (or Docker Engine with Compose).

1. Copy the example environment file and add a Gemini API key (free at
   <https://aistudio.google.com/apikey>):

   ```bash
   cp .env.example .env
   # then edit .env and set GEMINI_API_KEY=...
   ```

   The key is optional. Without it the app works fully, just without AI suggestions.

2. Start everything:

   ```bash
   docker-compose up --build
   ```

3. Open <http://localhost:3000>.

The API is also reachable directly at <http://localhost:8000/api/tickets/>.
Migrations run automatically when the backend starts.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | empty | Gemini API key. Empty disables suggestions. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model used for classification. |
| `DJANGO_SECRET_KEY` | dev-only value | Set a real value outside local development. |

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tickets/` | Create a ticket (201). |
| GET | `/api/tickets/` | List tickets, newest first. Filters: `?category=`, `?priority=`, `?status=`, `?search=` (title + description), all combinable. |
| PATCH | `/api/tickets/<id>/` | Partially update a ticket (status, category, priority, ...). |
| GET | `/api/tickets/stats/` | Aggregated statistics. |
| POST | `/api/tickets/classify/` | `{"description": "..."}` returns `{"suggested_category", "suggested_priority"}`. |

Invalid input returns `400` with field errors. If the LLM is unavailable, `classify`
returns `503` and the frontend falls back to manual selection.

## LLM choice: Google Gemini (`gemini-2.5-flash`)

- **Free tier with no credit card**, so reviewers can run the full feature at no cost.
- **Fast and cheap.** Classification is a small task that doesn't need a large
  reasoning model, and low latency matters because suggestions appear while the
  user is still filling in the form.
- **Structured output.** Gemini supports `responseSchema` with enums, so the
  response is constrained to valid JSON containing only our allowed labels.
- The model is configurable through `GEMINI_MODEL`.

The API is called over plain REST with `requests` instead of an SDK, which keeps
dependencies small and makes the timeout and error handling explicit.

### Prompt

The prompt is in [`backend/tickets/prompts.py`](backend/tickets/prompts.py). It:

- defines every category and priority level with concrete criteria, so labels are
  applied consistently;
- tells the model to judge priority by actual impact, not tone or words like "URGENT";
- tells the model to classify by the most severe issue when a ticket mentions several;
- defaults vague descriptions to `general` / `low`;
- wraps the user's text in `<ticket>` tags and tells the model to treat it as data,
  to reduce prompt injection;
- includes a few short examples.

Requests use `temperature: 0`, so the same description gets the same suggestion.

### Error handling

All LLM logic is in [`backend/tickets/llm.py`](backend/tickets/llm.py). These cases
raise a single `ClassificationError`, which the view turns into a `503`:

- missing API key;
- network error or timeout (10 seconds, configurable);
- non-2xx response;
- malformed JSON;
- labels outside the allowed choices (validated again on our side even though the
  schema already restricts them).

Ticket creation never calls the LLM, so submission always works. On the frontend, a
failure shows a short notice and the user picks the category and priority manually.

## Design decisions

### Data model
- Category, priority and status use `TextChoices`. Because Django `choices` are only
  checked in Python, each one also has a **`CheckConstraint`**, so PostgreSQL itself
  rejects invalid values, including writes that bypass Django's validation.
- `CheckConstraint`s also reject an empty `title` or `description` at the database level.
- `status` has both `default` and `db_default` set to `open`, so the default also
  applies to rows inserted outside Django.

### Stats endpoint
- All numbers come from **one `aggregate()` query** using conditional
  `Count(..., filter=Q(...))` expressions, so PostgreSQL does all the counting.
  No Python loop iterates over tickets. The dict comprehensions only build SQL
  expressions from the fixed choice lists.
- Categories and priorities with no tickets still appear with `0`.
- `avg_tickets_per_day` = total tickets ÷ number of days from the first ticket to
  today (inclusive). This reflects real throughput instead of only counting days that
  had tickets.

### API
- A DRF `GenericViewSet` with only the create, list and update mixins. `PUT` and
  `DELETE` are not exposed because the spec only needs `PATCH`.
- Filtering uses `django-filter`, and search uses DRF's `SearchFilter`
  (case-insensitive match on title and description). Invalid filter values return `400`.
- `stats` and `classify` are `@action`s on the same viewset, keeping all ticket
  endpoints under `/api/tickets/`.

### Frontend
- Components: `TicketForm`, `TicketList` (with `TicketFilters` and `TicketItem`), and
  `StatsDashboard`. All HTTP calls are in `src/api.js`.
- **Suggestion UX:** the description is debounced (800 ms) before calling
  `classify`, and there is no call for very short text. A loading message is shown
  during the call. In-flight requests are cancelled with `AbortController` when the
  text changes, so stale suggestions never overwrite newer ones. Once the user picks
  a category or priority manually, later suggestions don't overwrite that choice.
  Fields that still hold the AI's value show an "AI suggested" badge.
- **Refreshing data:** `App` keeps a `dataVersion` counter. Creating a ticket or
  changing its status increments it, and the list and stats refetch, without a page
  reload.
- Clicking a ticket expands it, showing the full description and a status dropdown.

### Docker
- Services: `db` (PostgreSQL 16), `backend` (gunicorn) and `frontend` (static Vite
  build served by nginx).
- Startup order uses healthchecks: the backend waits for a healthy database, and the
  frontend waits for a healthy backend.
- The backend runs `migrate` on every start.
- nginx serves the React app and proxies `/api/` to Django, so the browser talks to
  a single origin and no CORS configuration is needed.
- Secrets come from environment variables (`.env`, which is git-ignored), never
  from code.

## Use of AI tools

I used an AI coding assistant (Claude) while building this project, to help write
and review code. I worked through it step by step: I reviewed each change, ran and
tested the app (API calls, the browser UI, and a fresh `docker-compose up --build`),
and made each commit myself.

## Project structure

```
backend/
  config/            Django settings and root URLs
  tickets/
    models.py        Ticket model + DB constraints
    serializers.py
    views.py         Ticket viewset, stats and classify actions
    llm.py           Gemini client, validation, error handling
    prompts.py       Classification prompt
frontend/
  src/
    api.js           API client
    components/      TicketForm, TicketList, TicketFilters, TicketItem, StatsDashboard
    hooks/           useDebouncedValue
  nginx.conf
docker-compose.yml
```
