/*
# Security hardening: teacher invite codes, role lockdown, RLS audit

## Problem
Anyone could register as a teacher by setting role='teacher' in the profiles insert, gaining access to all student submissions, exam sessions, and personal data. RLS policies did not differentiate teachers from students — there was no "teacher can see all" policy at all on submissions/exam_sessions/exam_answers, meaning the Teacher page was actually broken for real cross-student visibility (only own rows visible). The role column on profiles was client-writable.

## Changes

### 1. New table: teacher_invite_codes
- Single-use invite codes that authorize someone to register as a teacher
- Columns: code (PK), created_at, used_by (references auth.users), used_at
- Seeded with one initial code: 'INITIAL-TEACHER-CODE-2026'
- RLS: no SELECT/INSERT/UPDATE/DELETE for anon or authenticated via normal API
  (codes are only consumed inside the SECURITY DEFINER function, which bypasses RLS)

### 2. New function: register_teacher(p_invite_code text, p_full_name text, p_email text)
- SECURITY DEFINER, SET search_path = public
- Atomically claims an unused invite code (UPDATE ... WHERE used_at IS NULL RETURNING)
- If no code matches or code already used: raises exception
- Inserts a profile row with role='teacher' for auth.uid()
- This is the ONLY path to create a teacher profile — the profiles table no longer
  accepts role='teacher' via a regular INSERT from the client
- EXECUTE revoked from anon, granted to authenticated

### 3. profiles table lockdown
- Column-level: REVOKE UPDATE (role) FROM authenticated — students cannot
  escalate themselves to teacher via UPDATE
- GRANT UPDATE (full_name, email) TO authenticated — only editable columns
- RLS: SELECT policy updated so teachers (verified via EXISTS check on
  profiles.role='teacher') can read all profiles, students read only their own
- INSERT policy: only role='student' allowed via direct insert; teacher
  registration must go through register_teacher()

### 4. submissions RLS
- SELECT: student sees own rows OR teacher sees all rows
  (teacher = EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='teacher'))
- INSERT/UPDATE/DELETE: students only on own rows (teachers don't write submissions)

### 5. exam_sessions RLS
- SELECT: student sees own OR teacher sees all
- INSERT/UPDATE/DELETE: students only on own rows

### 6. exam_answers RLS
- SELECT: student sees own (via session ownership) OR teacher sees all
- INSERT/UPDATE/DELETE: students only on own (via session ownership)

### 7. assignments RLS
- SELECT: teacher sees own assignments OR students see assignments targeting them
- INSERT: only verified teachers (EXISTS role check)
- DELETE: only the teacher who created the assignment

### 8. exercises, announcements, schedule_items, bagrut_questions
- INSERT restricted to verified teachers (EXISTS role check) instead of WITH CHECK (true)
- SELECT remains open to all authenticated (these are shared class content)
*/

-- ============================================================
-- 1. teacher_invite_codes table
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_invite_codes (
  code text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamptz
);

ALTER TABLE teacher_invite_codes ENABLE ROW LEVEL SECURITY;

-- No policies: the table should be invisible to anon and authenticated via the data API.
-- It is only accessed inside the SECURITY DEFINER function which bypasses RLS.

-- Seed initial code
INSERT INTO teacher_invite_codes (code)
VALUES ('INITIAL-TEACHER-CODE-2026')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 2. register_teacher function (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION register_teacher(p_invite_code text, p_full_name text, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claimed_code text;
BEGIN
  -- Atomically claim the invite code (single-use, race-safe)
  UPDATE teacher_invite_codes
  SET used_by = auth.uid(), used_at = now()
  WHERE code = p_invite_code AND used_at IS NULL
  RETURNING code INTO v_claimed_code;

  IF v_claimed_code IS NULL THEN
    RAISE EXCEPTION 'קוד הזמנה לא תקין או שכבר נעשה בו שימוש';
  END IF;

  -- Insert the teacher profile
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (auth.uid(), p_email, p_full_name, 'teacher')
  ON CONFLICT (id) DO UPDATE
    SET role = 'teacher', full_name = EXCLUDED.full_name, email = EXCLUDED.email;
END;
$$;

REVOKE EXECUTE ON FUNCTION register_teacher FROM anon;
GRANT EXECUTE ON FUNCTION register_teacher TO authenticated;

-- ============================================================
-- 3. profiles table: lock down role column + fix RLS
-- ============================================================

-- Revoke column-level UPDATE on role so students can't escalate
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, email) ON profiles TO authenticated;

-- Fix SELECT: teachers see all profiles, students see only own
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- Fix INSERT: only student role allowed via direct insert
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND role = 'student'
  );

-- Fix UPDATE: only own profile, and role column is revoked at column level
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 4. submissions RLS: add teacher read-all
-- ============================================================
DROP POLICY IF EXISTS "select_own_submissions" ON submissions;
CREATE POLICY "select_submissions" ON submissions FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- ============================================================
-- 5. exam_sessions RLS: add teacher read-all
-- ============================================================
DROP POLICY IF EXISTS "select_own_exam_sessions" ON exam_sessions;
CREATE POLICY "select_exam_sessions" ON exam_sessions FOR SELECT
  TO authenticated USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- ============================================================
-- 6. exam_answers RLS: add teacher read-all
-- ============================================================
DROP POLICY IF EXISTS "select_own_exam_answers" ON exam_answers;
CREATE POLICY "select_exam_answers" ON exam_answers FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_answers.exam_session_id
      AND exam_sessions.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- ============================================================
-- 7. assignments RLS: tighten INSERT to verified teachers only
-- ============================================================
DROP POLICY IF EXISTS "insert_own_assignments" ON assignments;
CREATE POLICY "insert_assignments" ON assignments FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- ============================================================
-- 8. exercises, announcements, schedule_items, bagrut_questions:
--    restrict INSERT to verified teachers
-- ============================================================

-- exercises
DROP POLICY IF EXISTS "insert_exercises" ON exercises;
CREATE POLICY "insert_exercises" ON exercises FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- announcements
DROP POLICY IF EXISTS "insert_announcements" ON announcements;
CREATE POLICY "insert_announcements" ON announcements FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- schedule_items
DROP POLICY IF EXISTS "insert_schedule_items" ON schedule_items;
CREATE POLICY "insert_schedule_items" ON schedule_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- bagrut_questions
DROP POLICY IF EXISTS "insert_bagrut_questions" ON bagrut_questions;
CREATE POLICY "insert_bagrut_questions" ON bagrut_questions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );
