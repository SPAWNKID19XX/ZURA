# Getting Started

This guide walks you through setting up ZURA on a local machine from scratch.

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Python | 3.11+ | Tested on 3.11 and 3.12 |
| Node.js | 18+ | LTS recommended |
| PostgreSQL | 14+ | Must be running before backend starts |
| npm | 9+ | Comes with Node.js |
| Git | any | — |

---

## 1. Clone the Repository

```bash
git clone https://github.com/SPAWNKID19XX/ZURA.git
cd ZURA
```

---

## 2. Backend Setup

### 2.1 — Create and Activate Virtual Environment

```bash
cd server
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate.bat       # Windows CMD
venv\Scripts\Activate.ps1       # Windows PowerShell
```

### 2.2 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

> If `requirements.txt` is missing, the core packages are:
> ```
> django
> djangorestframework
> djangorestframework-simplejwt
> django-cors-headers
> drf-spectacular
> psycopg2-binary
> python-dotenv
> Pillow
> ```

### 2.3 — Create PostgreSQL Database

```sql
-- Run in psql or pgAdmin
CREATE DATABASE zura;
CREATE USER zura_user_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zura_db TO zura_user_admin;
```

### 2.4 — Configure Environment Variables

Create `server/.env`:

```dotenv
SECRET_KEY=your-django-secret-key-here
DB_USER=zura_user
DB_NAME=zura_db
DB_PASSWORD=your_password
```

Generate a Django secret key:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2.5 — Run Migrations

```bash
python manage.py migrate
```

### 2.6 — (Optional) Create Admin User

```bash
python manage.py createsuperuser
```

### 2.7 — Start Backend Server

```bash
python manage.py runserver
```

The API is now available at **http://127.0.0.1:8000/**

---

## 3. Frontend Setup

Open a new terminal tab.

### 3.1 — Install Node Dependencies

```bash
cd client
npm install
```

### 3.2 — Configure Environment Variables

Create `client/.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
VITE_APP_EMPLOYEE=employees/api/v1
```

### 3.3 — Start Frontend Dev Server

```bash
npm run dev
```

The application is now available at **http://localhost:5173/**

---

## 4. First Run — Create Your Company

1. Open http://localhost:5173/signup
2. Fill in your email, password, and company name
3. This creates your account as the **SEO User** (company owner)
4. You are redirected to the dashboard

From here you can:
- Add team members at `/employees`
- Create projects at `/projects`
- Create and assign tasks at `/tasks`

---

## 5. Project Structure

```
ZURA/
├── server/                  # Django backend
│   ├── server/              # Django project settings & main URLconf
│   ├── users/               # Auth, company, employees, departments, roles
│   ├── tasks/               # Tasks CRUD + assignment signals
│   ├── projects/            # Projects CRUD + membership signals
│   ├── notifications/       # In-app notifications
│   ├── manage.py
│   ├── venv/                # Python virtual environment (not committed)
│   └── .env                 # Backend environment variables (not committed)
│
└── client/                  # React frontend (SPA)
    ├── public/
    ├── src/
    │   ├── api/             # Axios factory, AuthContext, AuthProvider, PrivateRoute
    │   ├── assets/
    │   ├── components/      # Reusable components (NavBar, forms, Footer)
    │   └── pages/           # Page-level components
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── .env                 # Frontend environment variables (not committed)
```

---

## 6. Available Scripts

### Backend

| Command | Description |
|---|---|
| `python manage.py runserver` | Start development server |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py makemigrations` | Create new migration files |
| `python manage.py createsuperuser` | Create Django admin superuser |
| `python manage.py shell` | Open Django interactive shell |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## 7. API Documentation

With the backend running, open:

| Interface | URL |
|---|---|
| Swagger UI | http://127.0.0.1:8000/docs/ |
| ReDoc | http://127.0.0.1:8000/redoc/ |
| OpenAPI Schema (JSON) | http://127.0.0.1:8000/schema/ |
| Django Admin | http://127.0.0.1:8000/admin/ |

---

## 8. Troubleshooting

### `ModuleNotFoundError: No module named 'django'`
Virtual environment is not activated. Run `source venv/bin/activate` from the `server/` directory.

### `django.db.utils.OperationalError: could not connect to server`
PostgreSQL is not running. Start it with `brew services start postgresql` (macOS) or `sudo systemctl start postgresql` (Linux).

### `CORS error in browser console`
Ensure the frontend runs on port 5173 (default Vite port). The allowed origins in `settings.py` are `http://localhost:5173` and `http://127.0.0.1:5173`. If you use a different port, add it to `CORS_ALLOWED_ORIGINS` in `server/server/settings.py`.

### `401 Unauthorized on all requests`
Token may have expired and refresh failed. Log out and log in again. If it persists, check that `VITE_API_URL` in `client/.env` matches the backend address exactly.
