TaskManager
# 🚀 ZURA

[English](#english) | [Русский](#русский)

---

<a name="english"></a>
## 🇬🇧 English

**ZURA** is the antidote to over-engineered task managers.

Remember when project management software helped you work instead of requiring a dedicated administrator? We do. ZURA is built for small teams and startups that need to **move cards**, not configure endless workflows.

### 🎯 Why ZURA?
*   **Zero Bloat:** Only the features 99% of teams actually use.
*   **Speed First:** No heavy scripts. Pure performance.
*   **Privacy:** Currently, you just clone and run it locally. Your data stays with you.

### 🛠 Roadmap
1.  **Phase 1 (Current):** Local-first. Clone, run, and work.
2.  **Phase 2:** Lightweight web app with basic sync.
3.  **Phase 3:** Becoming the go-to tool for agile startups.

### ⚡️ Quick Start
```bash
git clone https://github.com/SPAWNKID19XX/ZURA.git
cd zura
```
## 🗄️ Database Setup (PostgreSQL)

After completing the quick start, you need to **create a PostgreSQL database**
and configure database access in the Django settings.

---

### 1️⃣ Create PostgreSQL Database

Log in to PostgreSQL:

```bash
psql -U postgres psql
CREATE DATABASE zura;
```

### 2️⃣ Configure settings.py

Update the DATABASES section in settings.py:

```bash
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "zura",
        "USER": "task_manager_user",
        "PASSWORD": "strong_password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```
### 2️⃣ Apply Migrations

After configuring the database, apply migrations:

```bash
python manage.py migrate
```

### Notes
* PostgreSQL is the recommended database for production
* Do not commit real credentials to version control
* Use environment variables for sensitive data in production

## 🔐 Environment Variables (.env)

For security reasons, **do not store sensitive credentials in the repository** (e.g., database passwords, secret keys, JWT settings).  
Instead, keep them in a local **`.env`** file (not tracked by git) and load them into the application environment.

### Example `.env`
```env
DEBUG=False
SECRET_KEY=change_me_to_a_strong_secret_key

DB_NAME=task_manager
DB_USER=task_manager_user
DB_PASSWORD=strong_password
DB_HOST=localhost
DB_PORT=5432

JWT_ACCESS_TOKEN_LIFETIME_MIN=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

## 🧩 Initialization & Seeding Scripts

The project includes **initialization scripts** used to automatically populate
required database tables with default data.

These scripts are intended to be executed **after migrations** and before the application
is used in production or development.

### Purpose
Initialization scripts are used to:
- populate reference tables (departments, roles, statuses, etc.)
- ensure consistent data across environments
- simplify local development and onboarding
- avoid manual data creation

### Available Scripts

#### Seed Departments & Roles
Populates the database with predefined departments and roles.

```bash
./manage.py new_departments
```

## 🔐 Authentication & Users

### Authentication
The application uses **JWT-based authentication** with **email as the primary identifier**.

- Authentication is handled via **JWT tokens**
- Login is performed using **email + password**
- Access and refresh tokens are used
- Stateless authentication (suitable for API & frontend clients)

---

## 👤 User Model

The project uses a **custom user model** based on Django’s `AbstractUser`.

The default `username` field is not used — **email is the unique login field**.

### Base class
- `AbstractUser` (Django)

---

## 🧑‍💼 EmployeeUser (Custom User)

Each user in the system represents an **employee** of a company.

### Required fields
These fields are **mandatory** and must be set for every user:

- `email` – unique, used for authentication
- `department` – employee department (e.g. `dev`, `qa`, `design`)
- `role` – employee role within the department (e.g. `qa:auto`)
- `company` – company the employee belongs to
- `is_seo_user` – boolean flag indicating SEO / special access user

### Optional fields
These fields are **not required**:

- `avatar` – user profile image (optional)

---

## 📌 Notes on Architecture

- User-related business logic (departments, roles, company) lives inside the `users` app
- Roles and departments are treated as **domain concepts**, not task-related logic
- The role field uses a **code-based format** (e.g. `qa:auto`) to ensure:
  - consistency
  - easy seeding
  - easy permission mapping in the future

## 📝 Employee Registration (Frontend & Backend)
The project implements a custom signup flow using React on the frontend and Django REST Framework on the 
backend. This flow handles user creation and optional company initialization in a single atomic process.
### 🚀 Features
* Unified State Management: React uses a single formData object to manage all inputs (Email, Passwords, SEO Status, Company Name).
* Dual-Layer Validation:
  * Frontend: Instant password matching verification.
  * Backend: Django REST Framework Serializer validation for email uniqueness and password strength.
* Conditional Logic: The Company entity is only created if the user is flagged as a SEO User and provides a valid CompanyName.
### 🛠 Backend Implementation (DRF)
The SignUpSerializer handles the complexity of "popping" non-model fields from the request to prevent database errors:

```bash
# users/serializers.py snippet
def create(self, validated_data):
    # Extract non-model fields
    password = validated_data.pop('password')
    is_seo = validated_data.pop('is_seo_user', False)
    company_name = validated_data.pop('companyName', None)
    
    # Create User using Custom Manager
    user = EmployeeUser.objects.create_user(password=password, **validated_data)

    # Optional Company Initialization
    if is_seo and company_name:
        Company.objects.create(name=company_name, created_by=user)
    
    return user

```

### 💻 Frontend Implementation (React)
Uses Axios for asynchronous communication and dynamic error handling:
```bash
const handleSubmite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${API_URL}/new_employeer/`, formData);
        // Successful redirect to /login
    } catch (error: any) {
        // Mapping DRF object errors to UI
        setFieldErrors(error.response.data);
    }
};

```

## 📖 API Documentation & Schema
The Zura API is powered by OpenAPI 3.0. Use the links below to explore endpoints, schemas, and authentication requirements.
* **Static ReDoc:** - http://127.0.0.1:8000/redoc/
  * (Best for clean, high-level reading)
* **interactive Swagger UI:** - http://127.0.0.1:8000/docs/
  * (Recommended for testing and development)
* **Raw OpenAPI Schema (YAML/JSON)** - http://127.0.0.1:8000/schema/
  * Use this to generate automated TypeScript/TSX clients)

---


<a name="Русский"></a>
## 🇷🇺 Русский

**ZURA** — это антидот против переусложненных таск-менеджеров.

Помните времена, когда софт помогал работать, а не требовал отдельного администратора? Мы помним. **ZURA** создана для маленьких команд и стартапов, которым нужно **двигать карточки**, а не настраивать бесконечные воркфлоу.

### 🎯 Почему ZURA?
*   **Zero Bloat:** Только те функции, которыми реально пользуются 99% команд.
*   **Скорость прежде всего:** Никаких тяжелых скриптов. Всё летает.
*   **Приватность:** Сейчас это local-first решение. Вы просто клонируете репозиторий, и ваши данные остаются у вас.

### 🛠 План развития
1.  **Фаза 1 (Текущая):** Local-first версия. Клонируй, запускай, работай..
2.  **Фаза 2:** Легкое веб-приложение с базовой синхронизацией.
3.  **Фаза 3:** Стать инструментом №1 для быстрых стартапов.

### ⚡️ Быстрый старт
```bash
git clone https://github.com/SPAWNKID19XX/ZURA.git
cd zura
```

## 🗄️ Настройка базы данных (PostgreSQL)

После выполнения быстрого старта необходимо **создать базу данных PostgreSQL**
и указать параметры подключения в настройках Django.

---

### 1️⃣ Создание базы данных PostgreSQL

Войдите в PostgreSQL:

```bash
psql -U postgres psql
CREATE DATABASE zura;
```

### 2️⃣ Настройка settings.py

Обновите секцию DATABASES в файле settings.py:

```bash
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "zura",
        "USER": "task_manager_user",
        "PASSWORD": "strong_password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```
### 2️⃣ Применение миграций

После настройки базы данных выполните миграции:

```bash
python manage.py migrate
```

### Примечания
* PostgreSQL рекомендуется для production-окружения
* Не храните реальные логины и пароли в репозитории
* В production используйте переменные окружения


## 🔐 Переменные окружения (.env)

В целях безопасности **не храните конфиденциальные данные в репозитории**
(например, пароли базы данных, секретные ключи, настройки JWT).  
Вместо этого храните их в локальном файле **`.env`** (который не отслеживается git)
и загружайте в окружение приложения.

### Пример `.env`
```env
DEBUG=False
SECRET_KEY=change_me_to_a_strong_secret_key

DB_NAME=task_manager
DB_USER=task_manager_user
DB_PASSWORD=strong_password
DB_HOST=localhost
DB_PORT=5432

JWT_ACCESS_TOKEN_LIFETIME_MIN=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```


## 🇷🇺 Скрипты и автозаполнение данных


## 🧩 Скрипты инициализации и автозаполнения

В проекте используются **скрипты инициализации**, предназначенные для автоматического
заполнения определённых таблиц базы данных начальными данными.

Скрипты выполняются **после применения миграций** и до начала работы с приложением.

### Назначение
Скрипты автозаполнения используются для:
- заполнения справочных таблиц (департаменты, роли, статусы и т.д.)
- обеспечения одинаковых данных во всех окружениях
- упрощения локальной разработки и онбординга
- исключения ручного создания данных

### Доступные скрипты

#### Заполнение департаментов и ролей
Заполняет базу данных предопределёнными департаментами и ролями.

```bash
./manage.py new_departments
```

## 🔐 Аутентификация и пользователи

### Аутентификация
В приложении используется **JWT-аутентификация**, где **email является основным идентификатором пользователя**.

- Аутентификация реализована через **JWT-токены**
- Вход выполняется по **email + пароль**
- Используются **access** и **refresh** токены
- Аутентификация не хранит состояние (подходит для API и frontend-клиентов)

---

## 👤 Модель пользователя

В проекте используется **кастомная модель пользователя**, основанная на Django `AbstractUser`.

Стандартное поле `username` не используется — **email является уникальным полем для входа**.

### Базовый класс
- `AbstractUser` (Django)

---

## 🧑‍💼 EmployeeUser (кастомный пользователь)

Каждый пользователь в системе представляет собой **сотрудника компании**.

### Обязательные поля
Эти поля являются **обязательными** и должны быть заполнены для каждого пользователя:

- `email` – уникальный, используется для аутентификации
- `department` – департамент сотрудника (например: `dev`, `qa`, `design`)
- `role` – роль сотрудника внутри департамента (например: `qa:auto`)
- `company` – компания, к которой относится сотрудник
- `is_seo_user` – булево поле, указывающее на SEO / специальный тип доступа

### Необязательные поля
Эти поля **не являются обязательными**:

- `avatar` – аватар пользователя (опционально)

---

## 📌 Архитектурные заметки

- Вся бизнес-логика, связанная с пользователями (департаменты, роли, компания), находится в приложении `users`
- Роли и департаменты рассматриваются как **доменные сущности**, а не как логика задач
- Поле роли использует **кодовый формат** (например: `qa:auto`) для обеспечения:
  - единообразия
  - простого автозаполнения (seeding)
  - удобного расширения системы прав в будущем

## 📝 Регистрация сотрудников (Frontend & Backend)
В проекте реализован кастомный процесс регистрации, объединяющий создание пользователя и автоматическую 
инициализацию компании в одной транзакции.
### 🚀 Особенности реализации
* Единое состояние (State): На стороне React используется один объект formData для управления всеми полями (Email, пароли, статус SEO, название компании).
* Двухуровневая валидация:
  * Frontend: Мгновенная проверка совпадения паролей перед отправкой.
  * Backend: Валидация через Django REST Framework Serializer на уникальность Email и сложность пароля.
* Условная логика: Сущность Company создается только в том случае, если пользователь отмечен как is_seo_user и указал companyName.

## 🛠 Реализация на бэкенде (DRF)
SignUpSerializer обрабатывает сложные входящие данные, «вырезая» (pop) поля, которых нет в модели, 
чтобы избежать ошибок базы данных:
```bash
# users/serializers.py snippet
def create(self, validated_data):
    # Extract non-model fields
    password = validated_data.pop('password')
    is_seo = validated_data.pop('is_seo_user', False)
    company_name = validated_data.pop('companyName', None)
    
    # Create User using Custom Manager
    user = EmployeeUser.objects.create_user(password=password, **validated_data)

    # Optional Company Initialization
    if is_seo and company_name:
        Company.objects.create(name=company_name, created_by=user)
    
    return user

```

### 💻 Реализация на фронтенде (React
Использование Axios для асинхронного взаимодействия и динамической обработки ошибок:
```bash
const handleSubmite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${API_URL}/new_employeer/`, formData);
        // Successful redirect to /login
    } catch (error: any) {
        // Mapping DRF object errors to UI
        setFieldErrors(error.response.data);
    }
};
```

## 📖 Документация API и Схема
Zura API построен на базе стандарта OpenAPI 3.0. Используйте ссылки ниже для изучения эндпоинтов, структур данных (схем) и требований к авторизации.
* **Static ReDoc:** - http://127.0.0.1:8000/employees/api/v1/redoc/
  * Чистая и удобная документация для чтения)
* **nteractive Swagger UI:** - http://127.0.0.1:8000/employees/api/v1/docs/
  * Интерактивная панель для тестирования запросов в реальном времени)
* **Raw OpenAPI Schema (YAML/JSON)** - http://127.0.0.1:8000/employees/api/v1/schema/
  * (Машиночитаемая схема для генерации TypeScript/TSX клиентов)

---

