# ZURA — Project Overview (English)

## What It Is

ZURA is a self-hosted task manager for small teams and startups.
The goal is to build a simple alternative to Jira — without the bloat,
abstract UI, and corporate overengineering.

The project runs locally. Your data stays with you, not in someone else's cloud.

---

## Current State

The project is in its early stage. Only the user and company infrastructure
has been built so far. The actual task manager does not exist yet.

### What Already Works

- Registration and authentication (JWT)
- Two user types:
  - **SEO User** — company owner, can hire and manage employees
  - **Employee** — regular team member
- Company management (auto-created on registration)
- Employee management (hire, edit, delete)
- Departments and roles (QA, Development, DevOps, Design, etc. — ~60 roles)
- Password change and profile editing
- API documentation (Swagger / ReDoc)

### What Does Not Exist Yet

- Tasks — the core feature
- Projects / boards
- Task statuses, priorities, assignments
- Comments and attachments
- Notifications
- Search and filtering

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Backend      | Django + Django REST Framework      |
| Auth         | JWT (SimpleJWT)                     |
| Database     | PostgreSQL                          |
| Frontend     | React 19 + TypeScript               |
| Build tool   | Vite                                |
| Routing      | React Router                        |
| HTTP client  | Axios (with auto token refresh)     |
| State        | React Context + TanStack Query      |

---

## Architecture

```
ZURA/
├── server/          # Django backend (API)
│   └── users/       # Users, companies, departments, roles
└── client/          # React frontend (SPA)
    └── src/
        ├── api/         # Axios, JWT, auth context
        ├── components/  # Login, signup, profile forms
        └── pages/       # Pages: Login, Signup, MyAccount
```

---

## Key Design Decisions

- **Email instead of username** — login by email, no username field
- **Stateless auth** — JWT stored in localStorage, no server-side sessions
- **SEO User** — the first person to register for a company automatically
  becomes the owner and gets elevated permissions
- **Atomic company creation** — company is created in the same DB transaction
  as the user to prevent partial state

---

## Open Questions Before Moving Forward

Before building the task layer, it's worth deciding:

1. **Task model** — what is a task? What fields does it have?
   (title, description, status, priority, assignee, deadline, type?)

2. **Project model** — do tasks live inside projects, or directly in a company?

3. **Boards** — do you need Kanban? Scrum sprints? Or just a flat list?

4. **Access control** — who can create, edit, and close tasks?
   Only the owner? Any employee?

5. **Token storage** — localStorage is not safe for production.
   Consider httpOnly cookies?

---

## API Documentation

Start the backend and open in your browser:

- Swagger UI: `http://127.0.0.1:8000/docs/`
- ReDoc:       `http://127.0.0.1:8000/redoc/`
