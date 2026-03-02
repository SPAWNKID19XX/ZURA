# ZURA — Project Overview

## What Is ZURA?

ZURA is a self-hosted, lightweight project and task management platform built for small engineering teams. It is a pragmatic alternative to Jira — without the enterprise complexity, opaque pricing, or data vendor lock-in.

Your data lives on your own infrastructure. You control the server, the database, and the users.

---

## Current Status

The application is **feature-complete for its v1 scope** and actively used. All core modules are implemented and functional.

### Implemented Modules

| Module | Status | Notes |
|---|---|---|
| Authentication (JWT) | ✅ Done | Login, refresh, auto-renew |
| User Accounts | ✅ Done | Profile edit, password change |
| Company Management | ✅ Done | Auto-created on first registration |
| Employee Management | ✅ Done | Hire, view, fire |
| Departments & Roles | ✅ Done | ~60 predefined roles |
| Tasks (CRUD) | ✅ Done | Status, priority, assignment, due date |
| Projects | ✅ Done | Members, lead, status, linked tasks |
| In-app Notifications | ✅ Done | Task assignment, project membership |
| Responsive UI | ✅ Done | 350px → 4K |

### Stub Pages (Shell Only)

| Page | Route |
|---|---|
| Boards (Kanban) | `/boards` |
| Teams | `/teams` |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend framework | Django | 6.0.1 |
| REST API | Django REST Framework | latest |
| Authentication | SimpleJWT | latest |
| Database | PostgreSQL | latest |
| API Documentation | drf-spectacular | latest |
| Frontend framework | React | 19 |
| Language | TypeScript | ~5.9 |
| Build tool | Vite | 7 |
| Routing | React Router | 7 |
| HTTP client | Axios | 1.x |
| Server state | TanStack Query | 5 |
| Styling | CSS Modules | — |

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                         │
│                                                              │
│  React 19 + TypeScript                                       │
│  ├── React Router v7    (client-side routing)                │
│  ├── TanStack Query v5  (server state & caching)             │
│  ├── Axios              (HTTP + JWT interceptors)            │
│  └── CSS Modules        (scoped styles)                      │
└────────────────────────────┬─────────────────────────────────┘
                             │ REST / JSON  (port 5173 → 8000)
┌────────────────────────────▼─────────────────────────────────┐
│                     Django Backend                           │
│                                                              │
│  ├── users/        (auth, company, employees, roles)         │
│  ├── tasks/        (task CRUD + signals)                     │
│  ├── projects/     (project CRUD + signals)                  │
│  └── notifications/(notification list, unread count)         │
└────────────────────────────┬─────────────────────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │    PostgreSQL      │
                   └───────────────────┘
```

---

## Key Design Decisions

### Email-based Authentication
No username field exists. Users authenticate with email + password. The custom `EmployeeUser` model extends Django's `AbstractUser` with `USERNAME_FIELD = "email"`.

### Two User Roles
- **SEO User** — the company owner. Created on first registration. Can hire/fire employees, create projects, manage all tasks.
- **Employee** — a regular team member. Can view and work with tasks assigned to them or created by them. Access to projects they are a member of.

### Stateless JWT Auth
Tokens are stored in `localStorage`. An Axios interceptor automatically refreshes the access token on 401 responses using the refresh token, with no user interaction required. Refresh tokens rotate on each use and are blacklisted after rotation.

### Atomic Company Creation
When an SEO user registers, the company and user records are created in a single database transaction. This prevents partial state (user without company).

### Signal-driven Notifications
Notifications are created automatically by Django signals — no manual notification calls in business logic. `tasks/signals.py` fires on task assignment changes; `projects/signals.py` fires on `m2m_changed` for project membership.

### Department-based Task Permissions
Task creation is restricted by department. Non-SEO employees can only create tasks if their department is in an allowed list (Development, QA, DevOps, Design, Management, Business & Analysis, Cybersecurity).

---

## Running Locally

See [getting-started.md](getting-started.md) for full setup instructions.

```bash
# Backend
cd server && source venv/bin/activate && python manage.py runserver

# Frontend
cd client && npm run dev
```

**API Docs (backend must be running):**
- Swagger UI: http://127.0.0.1:8000/docs/
- ReDoc: http://127.0.0.1:8000/redoc/
- OpenAPI Schema: http://127.0.0.1:8000/schema/

---

## Documentation Index

| File | Contents |
|---|---|
| [overview_en.md](overview_en.md) | This file — project overview |
| [overview_ru.md](overview_ru.md) | Обзор проекта на русском |
| [getting-started.md](getting-started.md) | Installation & local setup |
| [api-reference.md](api-reference.md) | Complete REST API reference |
| [data-models.md](data-models.md) | Database models & schema |
| [frontend-architecture.md](frontend-architecture.md) | Frontend structure, routing, auth |
