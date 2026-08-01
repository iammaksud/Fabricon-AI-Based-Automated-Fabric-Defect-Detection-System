# Fabricon Backend

AI-Based Automated Fabric Defect Detection System — FastAPI backend.

**Status:** Foundation only. No business logic, authentication, database
models, Roboflow, or ESP32 integration implemented yet — see each
module's docstring for what's stubbed vs. real.

## Setup

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env` and adjust `DB_*` values to match your local MySQL instance,
and update `CORS_ORIGINS` if your frontend runs on a different port.

## Run

```bash
uvicorn app.main:app --reload
```

Then visit:
- http://127.0.0.1:8000/health — liveness check
- http://127.0.0.1:8000/docs — interactive Swagger UI (shows all registered routers)

## Run tests

```bash
pytest
```

## Database migrations (Alembic)

Once real models are added to `app/database/models.py`:

```bash
alembic revision --autogenerate -m "create initial tables"
alembic upgrade head
```

## Project layout

See `app/` for the layered structure: `core` (config/security), `database`
(connection/models), `schemas` (Pydantic DTOs), `routers` (HTTP layer),
`services` (external integrations + orchestration), `utils`, `middleware`.
