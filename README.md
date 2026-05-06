# University Dormitory Management System

Full-stack dormitory management system built with **FastAPI**, **PostgreSQL**, and **Next.js**.

---

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Database | PostgreSQL                          |
| Backend  | Python · FastAPI · SQLAlchemy       |
| Frontend | Next.js 14 · TypeScript · Tailwind  |
| Charts   | Recharts                            |

---

## Project Structure

```
dorm/
├── backend/          # FastAPI application
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas/      # Pydantic request/response models
│   └── routers/      # One router file per entity
├── frontend/         # Next.js application
│   └── src/
│       ├── app/
│       │   ├── student/   # Student portal pages
│       │   └── admin/     # Admin panel pages
│       ├── components/    # Reusable UI components
│       └── lib/           # axios instance + TypeScript types
├── schema.sql        # CREATE TABLE statements
├── seed.sql          # Sample data
└── README.md
```

---

## 1 · Database Setup

### Prerequisites
- PostgreSQL 14+ installed and running

```sql
-- Run in psql or pgAdmin
CREATE DATABASE dorm_db;
```

```bash
# Load schema
psql -U postgres -d dorm_db -f schema.sql

# Load seed data
psql -U postgres -d dorm_db -f seed.sql

# Set passwords for all seeded users (password: password123)
cd backend
python hash_passwords.py
```

---

## 2 · Backend Setup

### Prerequisites
- Python 3.10+

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configure environment

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/dorm_db
SECRET_KEY=yoursecretkey
```

### Run the backend

```bash
uvicorn main:app --reload
```

API available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

> Tables are created automatically on first startup via `Base.metadata.create_all`.

---

## 3 · Frontend Setup

### Prerequisites
- Node.js 18+

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend available at: `http://localhost:3000`

### Environment (optional)

Create `frontend/.env.local` to override the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 4 · Portals

| Portal        | URL                              |
|---------------|----------------------------------|
| Landing page  | http://localhost:3000            |
| Student portal| http://localhost:3000/student/dashboard |
| Admin panel   | http://localhost:3000/admin/dashboard   |

> The student portal defaults to `student_id = 1` (Ethan Brown from seed data).
> To switch students, change the `STUDENT_ID` constant in the student page files.

---

## 5 · API Endpoints

All endpoints are documented interactively at `http://localhost:8000/docs`.

### Standard CRUD (per entity)

```
GET    /{entity}/
GET    /{entity}/{id}
POST   /{entity}/
PATCH  /{entity}/{id}
DELETE /{entity}/{id}
```

Entities: `staff`, `students`, `dormitories`, `rooms`, `applications`, `assignments`, `payments`, `maintenance`

### Business Logic Endpoints

| Method | Route                            | Description                                      |
|--------|----------------------------------|--------------------------------------------------|
| PATCH  | `/applications/{id}/review`      | Approve or reject; auto-creates assignment + payments |
| PATCH  | `/assignments/{id}/checkout`     | Check out student, decrement room occupancy      |
| GET    | `/rooms/available`               | Rooms where current_occupancy < capacity         |
| GET    | `/reports/occupancy`             | Occupancy rate per dormitory                     |
| GET    | `/reports/unpaid`                | Students with unpaid/overdue payments            |
| GET    | `/reports/maintenance`           | Maintenance requests grouped by dorm and status  |
| GET    | `/reports/monthly-occupancy`     | Check-ins per month                              |

### Review application — request body

```json
{
  "action": "approved",
  "reviewed_by": 1,
  "room_id": 5,
  "check_out_date": "2026-06-30"
}
```

---

## 6 · Business Rules

- A student cannot be assigned to a full room (`current_occupancy >= capacity`)
- A student can only have one **active** assignment at a time
- Approving an application automatically creates an `Assignment` and increments `current_occupancy`
- When occupancy reaches capacity the room status switches to `full`
- Approving also auto-generates monthly `Payment` records until the check-out date
- Checking out a student decrements `current_occupancy` and sets `check_out_date`
- Only staff members can review applications (`reviewed_by` must be a valid `staff_id`)

---

## 7 · Seed Data Summary

| Table                 | Records |
|-----------------------|---------|
| Staff                 | 4       |
| Dormitories           | 3 (mixed / male / female) |
| Rooms                 | 30      |
| Students              | 20      |
| Applications          | 15 (10 approved, 2 rejected, 3 pending) |
| Assignments           | 10 active |
| Payments              | 30 (mixed paid / unpaid / overdue) |
| Maintenance Requests  | 12 (mixed open / in_progress / resolved) |
