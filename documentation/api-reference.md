# API Reference

All endpoints return JSON. All protected endpoints require the `Authorization: Bearer <access_token>` header.

**Base URL:** `http://127.0.0.1:8000`

**Interactive docs:** http://127.0.0.1:8000/docs/

---

## Authentication

ZURA uses JSON Web Tokens (JWT) via SimpleJWT.

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |
| `Content-Type` | `application/json` |

**Token lifetimes:**
- Access token: **60 minutes**
- Refresh token: **24 hours** (rotates on use, old token is blacklisted)

---

## 1. Auth & Users — `/employees/api/v1/`

### POST `/employees/api/v1/new_seo/`
Register a new company and SEO user (company owner).

**Auth required:** No

**Request body:**
```json
{
  "email": "owner@company.com",
  "password": "securepassword",
  "password_confirm": "securepassword",
  "companyName": "Acme Corp"
}
```

**Response `201 Created`:**
```json
{
  "id": 1,
  "email": "owner@company.com",
  "first_name": "",
  "last_name": "",
  "is_seo_user": true,
  "is_employee": false,
  "company": 1,
  "company_name": "Acme Corp"
}
```

---

### POST `/employees/api/v1/token/`
Obtain JWT access + refresh tokens (login).

**Auth required:** No

**Request body:**
```json
{
  "email": "user@company.com",
  "password": "securepassword"
}
```

**Response `200 OK`:**
```json
{
  "access": "<access_jwt>",
  "refresh": "<refresh_jwt>"
}
```

---

### POST `/employees/api/v1/token/refresh/`
Obtain a new access token using a refresh token.

**Auth required:** No

**Request body:**
```json
{
  "refresh": "<refresh_jwt>"
}
```

**Response `200 OK`:**
```json
{
  "access": "<new_access_jwt>",
  "refresh": "<new_refresh_jwt>"
}
```

> Refresh tokens rotate on each call. The old refresh token is immediately invalidated.

---

### GET `/employees/api/v1/my_account/`
Get the current authenticated user's profile.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "id": 1,
  "email": "user@company.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "+1234567890",
  "is_seo_user": false,
  "is_employee": true,
  "company": 1,
  "company_name": "Acme Corp",
  "department": 2,
  "department_name": "Development",
  "role": 15,
  "role_name": "Backend Developer"
}
```

---

### PATCH `/employees/api/v1/my_account/`
Update the current user's profile.

**Auth required:** Yes

**Request body** (all fields optional):
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response `200 OK`:** Updated user object (same shape as GET).

---

### POST `/employees/api/v1/change_password/`
Change the current user's password.

**Auth required:** Yes

**Request body:**
```json
{
  "current_password": "old_password",
  "password": "new_password",
  "confirm_password": "new_password"
}
```

**Response `200 OK`:**
```json
{
  "detail": "Password updated"
}
```

**Error `400 Bad Request`:**
```json
{
  "current_password": ["Wrong password."]
}
```

---

### GET `/employees/api/v1/departments/`
List all available departments.

**Auth required:** Yes

**Response `200 OK`:**
```json
[
  { "id": 1, "name": "Engineering" },
  { "id": 2, "name": "Development" },
  { "id": 3, "name": "QA" }
]
```

---

### GET `/employees/api/v1/roles/`
List all available roles.

**Auth required:** Yes

**Response `200 OK`:**
```json
[
  { "id": 1, "name": "Backend Developer", "department": 2 },
  { "id": 2, "name": "Frontend Developer", "department": 2 },
  { "id": 3, "name": "QA Engineer", "department": 3 }
]
```

---

### GET `/employees/api/v1/my_employeers/`
List all employees of the current user's company (excluding the requester).

**Auth required:** Yes

**Response `200 OK`:** Array of employee objects:
```json
[
  {
    "id": 2,
    "email": "employee@company.com",
    "first_name": "John",
    "last_name": "Smith",
    "phone": null,
    "is_seo_user": false,
    "is_employee": true,
    "company": 1,
    "company_name": "Acme Corp",
    "department": 2,
    "department_name": "Development",
    "role": 1,
    "role_name": "Backend Developer"
  }
]
```

---

### POST `/employees/api/v1/my_employeers/`
Hire a new employee. Creates a user account for them in the same company.

**Auth required:** Yes — SEO User only

**Request body:**
```json
{
  "email": "newdev@company.com",
  "first_name": "Alice",
  "last_name": "Johnson",
  "phone": "+1987654321",
  "department": 2,
  "role": 1,
  "password": "temp_password_123"
}
```

**Response `201 Created`:** Employee object (same shape as list item).

---

### GET `/employees/api/v1/my_employeers/{id}/`
Get a specific employee's details.

**Auth required:** Yes

**Response `200 OK`:** Employee object.

---

### PATCH `/employees/api/v1/my_employeers/{id}/`
Update an employee's information.

**Auth required:** Yes — SEO User only

**Request body** (all fields optional):
```json
{
  "first_name": "Alice",
  "department": 3,
  "role": 7
}
```

**Response `200 OK`:** Updated employee object.

---

### DELETE `/employees/api/v1/my_employeers/{id}/`
Remove an employee from the company (fire them).

**Auth required:** Yes — SEO User only

**Response `204 No Content`**

---

## 2. Tasks — `/tasks/api/v1/`

### GET `/tasks/api/v1/`
List tasks. Results are filtered by the user's permissions:
- SEO users see all company tasks.
- Employees see tasks created by or assigned to them.
- Optionally filter by project using the `?project=` query parameter.

**Auth required:** Yes

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `project` | integer | Filter tasks by project ID |

**Response `200 OK`:** Array of task objects:
```json
[
  {
    "id": 1,
    "title": "Implement login page",
    "description": "Build the login form with validation",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2026-03-01",
    "created_at": "2026-02-10T12:00:00Z",
    "updated_at": "2026-02-15T09:30:00Z",
    "author": "owner@company.com",
    "assigned_to": 2,
    "assigned_to_name": "John Smith",
    "project": 1
  }
]
```

---

### POST `/tasks/api/v1/`
Create a new task.

**Auth required:** Yes — SEO User OR employee in an allowed department (Development, QA, DevOps, Design, Management, Business & Analysis, Cybersecurity)

**Request body:**
```json
{
  "title": "Fix login bug",
  "description": "Users can't log in with Google accounts",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-03-10",
  "assigned_to": 2,
  "project": 1
}
```

| Field | Type | Required | Choices |
|---|---|---|---|
| `title` | string | ✅ | — |
| `description` | string | No | — |
| `status` | string | No | `todo`, `in_progress`, `done` |
| `priority` | string | No | `low`, `medium`, `high` |
| `due_date` | string (YYYY-MM-DD) | No | — |
| `assigned_to` | integer (user ID) | No | Company employees only |
| `project` | integer (project ID) | No | — |

**Response `201 Created`:** Created task object.

---

### GET `/tasks/api/v1/{id}/`
Get a specific task.

**Auth required:** Yes

**Response `200 OK`:** Task object.

---

### PATCH `/tasks/api/v1/{id}/`
Partially update a task (change status, reassign, edit fields).

**Auth required:** Yes

**Request body** (all fields optional):
```json
{
  "status": "done",
  "assigned_to": 3
}
```

**Response `200 OK`:** Updated task object.

> When `assigned_to` changes, the new assignee automatically receives a `task_assigned` notification.

---

### DELETE `/tasks/api/v1/{id}/`
Delete a task.

**Auth required:** Yes

**Response `204 No Content`**

---

## 3. Projects — `/projects/api/v1/`

### GET `/projects/api/v1/`
List projects visible to the current user (projects they created, lead, or are a member of).

**Auth required:** Yes

**Response `200 OK`:** Array of project objects:
```json
[
  {
    "id": 1,
    "title": "Website Redesign",
    "description": "Full redesign of the marketing site",
    "status": "active",
    "created_by": 1,
    "created_by_name": "Jane Doe",
    "lead": 2,
    "lead_name": "John Smith",
    "members": [2, 3, 4],
    "members_detail": [
      { "id": 2, "full_name": "John Smith", "role_name": "Backend Developer" },
      { "id": 3, "full_name": "Alice Brown", "role_name": "Frontend Developer" }
    ],
    "start_date": "2026-01-01",
    "end_date": "2026-06-30",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-02-01T14:00:00Z"
  }
]
```

---

### POST `/projects/api/v1/`
Create a new project.

**Auth required:** Yes — SEO User only

**Request body:**
```json
{
  "title": "Mobile App v2",
  "description": "Second major version of the mobile application",
  "status": "new",
  "lead": 2,
  "members": [2, 3, 4],
  "start_date": "2026-03-01",
  "end_date": "2026-09-30"
}
```

| Field | Type | Required | Choices |
|---|---|---|---|
| `title` | string | ✅ | — |
| `description` | string | No | — |
| `status` | string | No | `new`, `active`, `completed`, `archived` |
| `lead` | integer (user ID) | No | Company employees only |
| `members` | integer[] (user IDs) | No | Company employees only |
| `start_date` | string (YYYY-MM-DD) | No | — |
| `end_date` | string (YYYY-MM-DD) | No | — |

**Response `201 Created`:** Created project object.

> When members are added, each new member (excluding the creator) automatically receives a `project_added` notification.

---

### GET `/projects/api/v1/{id}/`
Get full details of a project.

**Auth required:** Yes — project creator, lead, or member

**Response `200 OK`:** Project object (full, including `members_detail`).

---

### PATCH `/projects/api/v1/{id}/`
Update a project.

**Auth required:** Yes — SEO User or project lead

**Request body** (all fields optional):
```json
{
  "title": "Mobile App v2.1",
  "status": "active",
  "members": [2, 3, 4, 5]
}
```

**Response `200 OK`:** Updated project object.

---

### DELETE `/projects/api/v1/{id}/`
Delete a project.

**Auth required:** Yes — SEO User only

**Response `204 No Content`**

---

## 4. Notifications — `/notifications/api/v1/`

### GET `/notifications/api/v1/`
List all notifications for the current user, sorted by newest first.

**Auth required:** Yes

**Response `200 OK`:** Array of notification objects:
```json
[
  {
    "id": 1,
    "type": "task_assigned",
    "message": "You have been assigned to task \"Fix login bug\"",
    "is_read": false,
    "created_at": "2026-02-28T10:15:00Z",
    "task": { "id": 3, "title": "Fix login bug" },
    "project": null
  },
  {
    "id": 2,
    "type": "project_added",
    "message": "You have been added to project \"Mobile App v2\"",
    "is_read": true,
    "created_at": "2026-02-27T09:00:00Z",
    "task": null,
    "project": { "id": 1, "title": "Mobile App v2" }
  }
]
```

---

### GET `/notifications/api/v1/unread_count/`
Get the count of unread notifications for the current user. Polled every 30 seconds by the NavBar.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "count": 3
}
```

---

### PATCH `/notifications/api/v1/{id}/`
Mark a single notification as read.

**Auth required:** Yes

**Request body:**
```json
{
  "is_read": true
}
```

**Response `200 OK`:** Updated notification object.

> Only the `is_read` field can be updated. All other fields are read-only.

---

### POST `/notifications/api/v1/mark_all_read/`
Mark all of the current user's unread notifications as read.

**Auth required:** Yes

**Request body:** `{}` (empty)

**Response `200 OK`:**
```json
{
  "status": "all marked as read"
}
```

---

## Error Reference

All errors follow standard DRF format:

**`400 Bad Request`** — Validation error:
```json
{
  "field_name": ["Error message."],
  "non_field_errors": ["Non-field error message."]
}
```

**`401 Unauthorized`** — Missing or invalid token:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**`403 Forbidden`** — Authenticated but insufficient permissions:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**`404 Not Found`:**
```json
{
  "detail": "Not found."
}
```
