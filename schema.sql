-- University Dormitory Management System — Schema

CREATE TABLE IF NOT EXISTS staff (
    staff_id      SERIAL PRIMARY KEY,
    full_name     VARCHAR(200) NOT NULL,
    role          VARCHAR(100) NOT NULL,
    email         VARCHAR(200) UNIQUE NOT NULL,
    phone         VARCHAR(20),
    password_hash VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS students (
    student_id      SERIAL PRIMARY KEY,
    full_name       VARCHAR(200) NOT NULL,
    email           VARCHAR(200) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    national_id     VARCHAR(50) UNIQUE,
    date_of_birth   DATE,
    gender          VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    faculty         VARCHAR(200),
    year_of_study   INTEGER CHECK (year_of_study BETWEEN 1 AND 8),
    created_at      TIMESTAMP DEFAULT NOW(),
    password_hash   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS dormitories (
    dorm_id     SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    address     VARCHAR(500),
    type        VARCHAR(20) NOT NULL CHECK (type IN ('mixed', 'male', 'female')),
    total_rooms INTEGER,
    staff_id    INTEGER REFERENCES staff(staff_id)
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id             SERIAL PRIMARY KEY,
    dorm_id             INTEGER NOT NULL REFERENCES dormitories(dorm_id),
    room_number         VARCHAR(20) NOT NULL,
    room_type           VARCHAR(50) CHECK (room_type IN ('single', 'double', 'triple')),
    capacity            INTEGER NOT NULL CHECK (capacity > 0),
    current_occupancy   INTEGER NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0),
    monthly_fee         NUMERIC(10, 2),
    status              VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'maintenance')),
    CONSTRAINT check_occupancy_le_capacity CHECK (current_occupancy <= capacity)
);

CREATE TABLE IF NOT EXISTS applications (
    application_id      SERIAL PRIMARY KEY,
    student_id          INTEGER NOT NULL REFERENCES students(student_id),
    dorm_id             INTEGER NOT NULL REFERENCES dormitories(dorm_id),
    preferred_move_in   DATE,
    room_preference     VARCHAR(50),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_at          TIMESTAMP DEFAULT NOW(),
    reviewed_at         TIMESTAMP,
    reviewed_by         INTEGER REFERENCES staff(staff_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    assignment_id   SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES students(student_id),
    room_id         INTEGER NOT NULL REFERENCES rooms(room_id),
    application_id  INTEGER NOT NULL REFERENCES applications(application_id),
    check_in_date   DATE NOT NULL,
    check_out_date  DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id      SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES students(student_id),
    assignment_id   INTEGER NOT NULL REFERENCES assignments(assignment_id),
    amount          NUMERIC(10, 2) NOT NULL,
    payment_type    VARCHAR(50) DEFAULT 'monthly',
    status          VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'overdue')),
    due_date        DATE NOT NULL,
    paid_date       DATE,
    receipt_number  VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    request_id  SERIAL PRIMARY KEY,
    room_id     INTEGER NOT NULL REFERENCES rooms(room_id),
    student_id  INTEGER NOT NULL REFERENCES students(student_id),
    assigned_to INTEGER REFERENCES staff(staff_id),
    category    VARCHAR(100),
    description TEXT,
    priority    VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status      VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    submitted_at TIMESTAMP DEFAULT NOW(),
    resolved_at  TIMESTAMP
);

-- Indexes on frequently-queried foreign keys
CREATE INDEX IF NOT EXISTS ix_rooms_dorm_id            ON rooms(dorm_id);
CREATE INDEX IF NOT EXISTS ix_applications_student_id  ON applications(student_id);
CREATE INDEX IF NOT EXISTS ix_applications_dorm_id     ON applications(dorm_id);
CREATE INDEX IF NOT EXISTS ix_assignments_student_id   ON assignments(student_id);
CREATE INDEX IF NOT EXISTS ix_assignments_room_id      ON assignments(room_id);
CREATE INDEX IF NOT EXISTS ix_payments_student_id      ON payments(student_id);
CREATE INDEX IF NOT EXISTS ix_payments_assignment_id   ON payments(assignment_id);
CREATE INDEX IF NOT EXISTS ix_maintenance_room_id      ON maintenance_requests(room_id);
CREATE INDEX IF NOT EXISTS ix_maintenance_student_id   ON maintenance_requests(student_id);
