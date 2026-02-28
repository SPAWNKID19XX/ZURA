# Data Models

This document describes all database models in ZURA, their fields, relationships, and the rationale behind key design choices.

---

## Entity Relationship Overview

```
Company ──< EmployeeUser >── Department
                │                │
                │             Role
                │
                ├──< Task
                │      ├── author (EmployeeUser)
                │      ├── assigned_to (EmployeeUser)
                │      └── project (Project)
                │
                └──< Project
                       ├── created_by (EmployeeUser)
                       ├── lead (EmployeeUser)
                       └──>< members (EmployeeUser)


EmployeeUser ──< Notification
                      ├── task (Task, optional)
                      └── project (Project, optional)
```

---

## App: `users`

### EmployeeUser

Custom user model. Replaces Django's default `User`. Authentication is via email (no username).

**File:** `server/users/models.py`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | PK | Auto-generated primary key |
| `email` | EmailField | unique, max_length=255 | Login identifier — replaces username |
| `first_name` | CharField | max_length=150, blank=True | From `AbstractUser` |
| `last_name` | CharField | max_length=150, blank=True | From `AbstractUser` |
| `password` | CharField | — | Hashed (from `AbstractUser`) |
| `is_active` | BooleanField | default=True | From `AbstractUser` |
| `is_staff` | BooleanField | default=False | Django admin access |
| `is_seo_user` | BooleanField | default=False | Company owner flag |
| `is_employee` | BooleanField | default=True | Regular employee flag |
| `phone` | CharField | max_length=15, null, blank | Optional contact phone |
| `avatar` | ImageField | upload_to="avatars", null, blank | Optional profile picture |
| `date_joined` | DateTimeField | auto_now_add | From `AbstractUser` |
| `company` | FK → Company | CASCADE, null, blank | The user's company |
| `department` | FK → Department | CASCADE, null, blank | The user's department |
| `role` | FK → Role | CASCADE, null, blank | The user's role within the department |

**Key settings:**
```python
USERNAME_FIELD = "email"
REQUIRED_FIELDS = []  # No extra required fields for createsuperuser
```

**Relationships:**
- `created_tasks` — Tasks authored by this user
- `assigned_tasks` — Tasks assigned to this user
- `notifications` — Notifications addressed to this user
- `created_projects` — Projects created by this user
- `led_projects` — Projects where this user is lead
- `member_projects` — Projects where this user is a member

---

### Company

Represents a team/organization. Created atomically with the first (SEO) user during registration.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | PK | — |
| `name` | CharField | max_length=100, unique | Company name (must be globally unique) |
| `created_by` | FK → EmployeeUser | CASCADE, null, blank | The founding SEO user |

**Relationships:**
- `employees` — All `EmployeeUser` records in this company
- `tasks` — All tasks belonging to this company
- `projects` — All projects belonging to this company

---

### Department

Pre-populated lookup table. Departments group related roles.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | PK | — |
| `name` | CharField | max_length=100 | E.g. "Development", "QA", "Design" |

---

### Role

Pre-populated lookup table. Each role belongs to a department.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | PK | — |
| `name` | CharField | max_length=100 | E.g. "Backend Developer", "QA Engineer" |
| `code` | CharField | max_length=100 | Machine-readable identifier |
| `department` | FK → Department | CASCADE, null, blank | Parent department |

---

## App: `tasks`

### Task

The core work item in ZURA.

**File:** `server/tasks/models.py`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | PK | — |
| `title` | CharField | max_length=255 | Short task title |
| `description` | TextField | blank=True | Detailed description (can be empty) |
| `status` | CharField | max_length=20, choices | Current state of the task |
| `priority` | CharField | max_length=10, choices | Urgency level |
| `due_date` | DateField | null, blank | Optional deadline (date only, no time) |
| `created_at` | DateTimeField | auto_now_add | Creation timestamp |
| `updated_at` | DateTimeField | auto_now | Last modification timestamp |
| `author` | FK → EmployeeUser | CASCADE | Creator — set automatically to `request.user` |
| `assigned_to` | FK → EmployeeUser | SET_NULL, null, blank | The person responsible for completing the task |
| `company` | FK → Company | CASCADE | Tenant scope — set automatically from the author's company |
| `project` | FK → Project | SET_NULL, null, blank | Optional project association |

**Status choices:**

| Value | Display |
|---|---|
| `todo` | To Do |
| `in_progress` | In Progress |
| `done` | Done |

**Priority choices:**

| Value | Display |
|---|---|
| `low` | Low |
| `medium` | Medium (default) |
| `high` | High |

**Business rules:**
- `author` is automatically set to `request.user` on creation (not exposed as writable in the serializer).
- `company` is automatically set to the author's company on creation.
- `assigned_to` must belong to the same company as the task.
- When `assigned_to` changes and the new assignee is not the author, a `task_assigned` notification is automatically created (via Django signal).

---

## App: `projects`

### Project

A container that groups related tasks and team members.

**File:** `server/projects/models.py`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | PK | — |
| `title` | CharField | max_length=255 | Project name |
| `description` | TextField | blank=True | Extended description |
| `status` | CharField | max_length=20, choices | Lifecycle stage |
| `start_date` | DateField | null, blank | Optional start date |
| `end_date` | DateField | null, blank | Optional deadline |
| `created_at` | DateTimeField | auto_now_add | — |
| `updated_at` | DateTimeField | auto_now | — |
| `company` | FK → Company | CASCADE | Tenant scope — set automatically |
| `created_by` | FK → EmployeeUser | CASCADE | Project creator |
| `lead` | FK → EmployeeUser | SET_NULL, null, blank | Project lead (optional, from same company) |
| `members` | M2M → EmployeeUser | blank | Project members (from same company) |

**Status choices:**

| Value | Display |
|---|---|
| `new` | New (default) |
| `active` | Active |
| `completed` | Completed |
| `archived` | Archived |

**Business rules:**
- `company` is set automatically from `request.user.company` on creation.
- `lead` and `members` must belong to the same company.
- Only SEO users can create projects.
- SEO users or the project lead can update a project.
- When new members are added (via M2M update), each new member (except the creator) automatically receives a `project_added` notification (via Django signal).

---

## App: `notifications`

### Notification

An in-app alert created automatically by Django signals. Users cannot create notifications directly via the API.

**File:** `server/notifications/models.py`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | PK | — |
| `type` | CharField | max_length=50, choices | Category of the event |
| `message` | CharField | max_length=500 | Human-readable description |
| `is_read` | BooleanField | default=False | Whether the user has seen this |
| `created_at` | DateTimeField | auto_now_add | — |
| `recipient` | FK → EmployeeUser | CASCADE | The user this notification is addressed to |
| `task` | FK → Task | SET_NULL, null, blank | Related task (for `task_assigned` type) |
| `project` | FK → Project | SET_NULL, null, blank | Related project (for `project_added` type) |

**Type choices:**

| Value | Display | Trigger |
|---|---|---|
| `task_assigned` | Task Assigned | `assigned_to` field on Task changes |
| `project_added` | Added to Project | User added to `Project.members` |

**Default ordering:** `-created_at` (newest first)

**Business rules:**
- A `task_assigned` notification is NOT created if the assignee is the task author.
- A `project_added` notification is NOT created for the project creator.
- Notifications are user-scoped: a user can only read/modify their own notifications.
- Only `is_read` is writable via the API. All other fields are read-only.

---

## Signal Flow

```
Task.save()
  └── pre_save signal
  │     └── cache instance._old_assigned_to
  └── post_save signal
        └── if assigned_to changed AND assigned_to != author:
              Notification.objects.create(
                  recipient=new_assigned_to,
                  type='task_assigned',
                  message='You have been assigned to task "..."',
                  task=instance
              )


Project.members.add(user_ids)
  └── m2m_changed signal (action='post_add')
        └── for each new member_id:
              if member != project.created_by:
                Notification.objects.create(
                    recipient=member,
                    type='project_added',
                    message='You have been added to project "..."',
                    project=instance
                )
```

---

## Migrations

| App | Migration | Description |
|---|---|---|
| `users` | `0001_initial` | EmployeeUser, Company, Department, Role |
| `tasks` | `0001_initial` | Task model |
| `projects` | `0001_initial` | Project model |
| `notifications` | `0001_initial` | Notification model |

To view the current migration state:
```bash
python manage.py showmigrations
```

To apply all migrations:
```bash
python manage.py migrate
```
