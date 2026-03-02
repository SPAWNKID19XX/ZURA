# Frontend Architecture

The frontend is a Single Page Application (SPA) built with React 19 and TypeScript, bundled by Vite.

---

## Directory Structure

```
client/src/
├── api/
│   ├── api.tsx            # Axios factory — getApi()
│   ├── authContext.tsx    # AuthContext interface + createContext
│   ├── authProvider.tsx   # AuthProvider — initialises user from localStorage
│   └── privateRouts.tsx   # ProtectedRoute — redirects unauthenticated users
│
├── assets/
│   └── img/logo.png
│
├── components/
│   ├── nav-bar/
│   │   ├── nav-bar.tsx
│   │   └── nav-bar.module.css
│   ├── footer/
│   │   ├── footer.tsx
│   │   └── footer.module.css
│   ├── login-form/
│   │   ├── LoginForm.tsx
│   │   └── LoginForm.module.css
│   ├── signup-form/
│   │   ├── SignupForm.tsx
│   │   └── SignupForm.module.css
│   └── account-form/
│       ├── MyAccountForm.tsx
│       └── MyAccountForm.module.css
│
├── pages/
│   ├── login-page/         LoginPage.tsx
│   ├── signup-page/        SignupPage.tsx
│   ├── my-account-page/    MyAccountPage.tsx
│   ├── tasks-page/         TasksPage.tsx, CreateTaskPage.tsx
│   ├── projects-page/      ProjectsPage.tsx, ProjectDetailPage.tsx, ProjectFormModal.tsx
│   ├── employees-page/     EmployeesPage.tsx
│   ├── notifications-page/ NotificationsPage.tsx
│   ├── boards-page/        BoardsPage.tsx  (placeholder)
│   └── teams-page/         TeamsPage.tsx   (placeholder)
│
├── App.tsx                # Main router configuration
├── main.tsx               # React entry — mounts providers
├── index.css              # Global base styles
└── App.css                # Container utility class + responsive rules
```

---

## Application Bootstrap (`main.tsx`)

```
<QueryClientProvider>       ← TanStack Query cache
  <ReactQueryDevtools />    ← Dev-only query inspector
  <BrowserRouter>           ← React Router v7
    <AuthProvider>          ← JWT state (user, loading, loginSuccess, logout)
      <App />               ← Route tree
    </AuthProvider>
  </BrowserRouter>
</QueryClientProvider>
```

---

## Routing (`App.tsx`)

| Route | Component | Protected | Notes |
|---|---|---|---|
| `/` | Inline div | No | Simple home placeholder |
| `/login` | `<LoginPage>` | No | — |
| `/signup` | `<SignupPage>` | No | — |
| `/my_account` | `<MyAccountPage>` | ✅ | — |
| `/tasks` | `<TasksPage>` | ✅ | Task list + inline modal |
| `/tasks/create` | `<CreateTaskPage>` | ✅ | Task creation form |
| `/projects` | `<ProjectsPage>` | ✅ | Project cards grid |
| `/projects/:id` | `<ProjectDetailPage>` | ✅ | Project detail + tasks + members |
| `/boards` | `<BoardsPage>` | ✅ | Placeholder |
| `/teams` | `<TeamsPage>` | ✅ | Placeholder |
| `/employees` | `<EmployeesPage>` | ✅ | Employee table + hire/fire modals |
| `/notifications` | `<NotificationsPage>` | ✅ | Notification list |

Protected routes are wrapped by `<ProtectedRoute>` which redirects to `/login` if the user is not authenticated.

---

## Authentication

### Storage

| Key | Value | Description |
|---|---|---|
| `localStorage.access` | JWT string | Access token (60 min) |
| `localStorage.refresh` | JWT string | Refresh token (24 h, rotates) |

### Auth Context

**File:** `client/src/api/authContext.tsx`

```typescript
interface Employeer {
    id?: number
    email: string
    first_name?: string
    last_name?: string
    is_employeer?: boolean
    is_seo_user?: boolean
    department_name?: string | null
}

interface AuthContextType {
    user: Employeer | null
    loading: boolean
    loginSuccess: (userData: Employeer) => void
    logout: () => void
}
```

### Initialisation Flow (`AuthProvider`)

1. On mount, check if `localStorage.access` exists.
2. If yes → call `GET /employees/api/v1/my_account/` to hydrate the user object.
3. If the request succeeds → call `loginSuccess(userData)`, set `loading = false`.
4. If the request fails (expired token) → call `logout()`.
5. If no token → set `loading = false`, `user = null`.

This ensures that on page refresh the user stays logged in without requiring a manual re-login, as long as their refresh token is still valid.

### Login Flow (`LoginForm`)

```
User submits email + password
  └── POST /employees/api/v1/token/
        ├── Store access token  → localStorage.access
        ├── Store refresh token → localStorage.refresh
        ├── GET /employees/api/v1/my_account/
        └── Call loginSuccess(userData) → populate AuthContext
              └── Navigate to "/"
```

### Logout

```
User clicks "Logout"
  └── Remove localStorage.access
  └── Remove localStorage.refresh
  └── Set user = null in AuthContext
  └── Navigate to /login
```

### Auto Token Refresh (`getApi` factory)

**File:** `client/src/api/api.tsx`

The `getApi(baseURL)` factory returns an Axios instance with two interceptors:

**Request interceptor:**
```
Every request → add Authorization: Bearer <localStorage.access>
```

**Response interceptor:**
```
Response arrives
  └── If 401 AND not a retry:
        ├── POST /employees/api/v1/token/refresh/ (with refresh token)
        ├── If success:
        │     ├── localStorage.access = new token
        │     └── Retry original request with new token
        └── If failure:
              └── Reject (AuthProvider will logout the user)
```

---

## API Instances

Each module creates its own Axios instance via `getApi()`:

| Module | Instance variable | Base URL |
|---|---|---|
| Login/Signup | local `api` | `${VITE_API_URL}/${VITE_APP_EMPLOYEE}` |
| MyAccountForm | local `api` | `${VITE_API_URL}/${VITE_APP_EMPLOYEE}` |
| TasksPage | module-level `api` | `${VITE_API_URL}/tasks/api/v1` |
| CreateTaskPage | module-level `api` | `${VITE_API_URL}/tasks/api/v1` |
| ProjectsPage | module-level `api` | `${VITE_API_URL}/projects/api/v1` |
| ProjectDetailPage | module-level `api` | `${VITE_API_URL}/projects/api/v1` |
| EmployeesPage | module-level `api` | `${VITE_API_URL}/employees/api/v1` |
| NotificationsPage | module-level `api` | `${VITE_API_URL}/notifications/api/v1` |
| NavBar | module-level `notificationsApi` | `${VITE_API_URL}/notifications/api/v1` |

---

## State Management

ZURA uses two complementary approaches:

| Concern | Tool |
|---|---|
| Server data (tasks, projects, etc.) | TanStack Query v5 |
| Auth state (current user) | React Context (`AuthContext`) |
| Local UI state (modals, forms) | `useState` |

### TanStack Query Keys

All query keys and what they cache:

| Query Key | Endpoint | Description |
|---|---|---|
| `['tasks']` | `GET /tasks/api/v1/` | All company tasks (or filtered by project) |
| `['tasks', { project: id }]` | `GET /tasks/api/v1/?project={id}` | Tasks filtered by project |
| `['projects']` | `GET /projects/api/v1/` | User's visible projects |
| `['project', id]` | `GET /projects/api/v1/{id}/` | Single project detail |
| `['employees']` | `GET /employees/api/v1/my_employeers/` | Company employees |
| `['departments']` | `GET /employees/api/v1/departments/` | Department lookup |
| `['roles']` | `GET /employees/api/v1/roles/` | Role lookup |
| `['notifications']` | `GET /notifications/api/v1/` | User's notification list |
| `['unreadCount']` | `GET /notifications/api/v1/unread_count/` | Unread badge count |

### Cache Invalidation on Mutations

| User action | Invalidated keys |
|---|---|
| Create task | `['tasks']` |
| Update task (status, assign, etc.) | `['tasks']` |
| Delete task | `['tasks']` |
| Create project | `['projects']` |
| Update project | `['projects']`, `['project', id]` |
| Delete project | `['projects']` |
| Hire employee | `['employees']` |
| Fire employee | `['employees']` |
| Mark notification read | `['notifications']`, `['unreadCount']` |
| Mark all notifications read | `['notifications']`, `['unreadCount']` |

---

## Styling

**Approach:** CSS Modules — every component and page has a co-located `.module.css` file. Class names are scoped locally and cannot leak to other components.

```
pages/tasks-page/
├── TasksPage.tsx
└── TasksPage.module.css   ← only used in TasksPage.tsx
```

**Global styles:**

| File | Purpose |
|---|---|
| `src/index.css` | Body reset, base font, dark/light mode via `prefers-color-scheme` |
| `src/App.css` | `.container` utility class, responsive container breakpoints |

**Responsive breakpoints:**

| Breakpoint | Width | Scope |
|---|---|---|
| 4K | ≥ 2560px | Larger container (1800px), base font 18px |
| Desktop | ≤ 1279px | Logo 70px |
| Tablet | ≤ 1023px | Nav link font reduction |
| Mobile | ≤ 767px | Hamburger menu, bottom-sheet modals, 1-column grids |
| Small mobile | ≤ 479px | Container 94%, additional scale-down |

---

## Environment Variables

**File:** `client/.env`

| Variable | Example Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000` | Backend server base URL |
| `VITE_APP_EMPLOYEE` | `employees/api/v1` | Path prefix for the users/auth API |

> In production, `VITE_API_URL` should point to your deployed backend (e.g. `https://api.yourdomain.com`).

---

## Key TypeScript Interfaces

### Auth

```typescript
// authContext.tsx
interface Employeer {
    id?: number
    email: string
    first_name?: string
    last_name?: string
    is_employeer?: boolean
    is_seo_user?: boolean
    department_name?: string | null
}
```

### Tasks

```typescript
// TasksPage.tsx
interface Task {
    id: number
    title: string
    description: string
    status: 'todo' | 'in_progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
    created_at: string
    updated_at: string
    author: string          // email string
    assigned_to: number | null
    assigned_to_name: string | null
    project: number | null
}

interface Employee {
    id: number
    first_name: string
    last_name: string
    email: string
}
```

### Projects

```typescript
// ProjectsPage.tsx / ProjectDetailPage.tsx
type ProjectStatus = 'new' | 'active' | 'completed' | 'archived'

interface ProjectMember {
    id: number
    full_name: string
    role_name: string | null
}

interface Project {
    id: number
    title: string
    description: string
    status: ProjectStatus
    created_by: number
    created_by_name: string
    lead: number | null
    lead_name: string | null
    members: number[]
    members_detail: ProjectMember[]
    start_date: string | null
    end_date: string | null
    created_at: string
    updated_at: string
}
```

### Employees

```typescript
// EmployeesPage.tsx
interface Employee {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string | null
    is_seo_user: boolean
    company: number | null
    company_name: string | null
    department: number | null
    department_name: string | null
    role: number | null
    role_name: string | null
}

interface Department {
    id: number
    name: string
}

interface Role {
    id: number
    name: string
    department: number
}
```

### Notifications

```typescript
// NotificationsPage.tsx
interface Notification {
    id: number
    type: 'task_assigned' | 'project_added'
    message: string
    is_read: boolean
    created_at: string
    task: { id: number; title: string } | null
    project: { id: number; title: string } | null
}
```

---

## NavBar & Notifications Badge

The NavBar polls `GET /notifications/api/v1/unread_count/` every **30 seconds** when the user is logged in. When `count > 0`, a red badge is rendered next to the "Notifications" link.

On mobile (≤ 767px), the NavBar switches to a hamburger menu. Clicking the hamburger toggles the `menuOpen` state which controls the `nav_body_open` CSS class. Clicking any nav link closes the menu.

```
NavBar state:
  menuOpen: boolean         ← hamburger toggle
  unreadData: { count: n }  ← polled every 30s, only when logged in
```
