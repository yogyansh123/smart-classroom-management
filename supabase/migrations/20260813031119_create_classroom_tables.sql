/*
# Create Smart Classroom Management Portal tables

Creates the five core tables for the portal and enables RLS on each.
This is a shared admin portal: any authenticated user can read and write
all rows. There is no per-user ownership — the login screen is the gate.

1. New Tables
- `classes` — scheduled class sessions (subject, faculty, room, date, times, status)
- `students` — enrolled students (name, roll number, email, class name)
- `attendance` — per-student attendance records keyed by class + date
- `assignments` — coursework with pending/completed status
- `notices` — announcement cards with title, message, date

2. Security
- RLS enabled on every table.
- Four policies per table (SELECT/INSERT/UPDATE/DELETE), all `TO authenticated`.
- USING(true)/WITH CHECK(true) is intentional: the portal is a shared
  admin workspace with no per-user ownership. Unauthenticated (anon)
  access is denied — the login screen gates entry.
*/

-- classes
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  faculty text NOT NULL,
  room text NOT NULL,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  status text NOT NULL DEFAULT 'Scheduled'
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_classes" ON classes;
CREATE POLICY "select_classes" ON classes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_classes" ON classes;
CREATE POLICY "insert_classes" ON classes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_classes" ON classes;
CREATE POLICY "update_classes" ON classes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_classes" ON classes;
CREATE POLICY "delete_classes" ON classes FOR DELETE
  TO authenticated USING (true);

-- students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll_number text NOT NULL,
  email text NOT NULL,
  class_name text NOT NULL
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_students" ON students;
CREATE POLICY "select_students" ON students FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_students" ON students;
CREATE POLICY "insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_students" ON students;
CREATE POLICY "update_students" ON students FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_students" ON students;
CREATE POLICY "delete_students" ON students FOR DELETE
  TO authenticated USING (true);

-- attendance
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  attendance_date date NOT NULL,
  status text NOT NULL DEFAULT 'Present'
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_attendance" ON attendance;
CREATE POLICY "select_attendance" ON attendance FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_attendance" ON attendance;
CREATE POLICY "insert_attendance" ON attendance FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_attendance" ON attendance;
CREATE POLICY "update_attendance" ON attendance FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_attendance" ON attendance;
CREATE POLICY "delete_attendance" ON attendance FOR DELETE
  TO authenticated USING (true);

-- assignments
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'Pending'
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_assignments" ON assignments;
CREATE POLICY "select_assignments" ON assignments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_assignments" ON assignments;
CREATE POLICY "insert_assignments" ON assignments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_assignments" ON assignments;
CREATE POLICY "update_assignments" ON assignments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_assignments" ON assignments;
CREATE POLICY "delete_assignments" ON assignments FOR DELETE
  TO authenticated USING (true);

-- notices
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  date date NOT NULL
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_notices" ON notices;
CREATE POLICY "select_notices" ON notices FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_notices" ON notices;
CREATE POLICY "insert_notices" ON notices FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_notices" ON notices;
CREATE POLICY "update_notices" ON notices FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_notices" ON notices;
CREATE POLICY "delete_notices" ON notices FOR DELETE
  TO authenticated USING (true);
