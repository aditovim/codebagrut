/*
# Add Exam Sessions, Exam Answers, and Assignments tables

1. New Tables
- `exam_sessions` — tracks a student's timed mock exam: start/end times, duration, status, total score
- `exam_answers` — per-question answers within an exam session: code submitted, AI score, AI feedback
- `assignments` — teacher-assigned homework: links a teacher + exercise to a student (or whole class), with due date

2. Security
- RLS enabled on all three tables.
- exam_sessions: students CRUD their own sessions; teachers can SELECT all (to monitor class)
- exam_answers: students CRUD answers for their own exam sessions; teachers can SELECT all
- assignments: teachers manage their own assignments; students SELECT assignments where assigned_to = 'all' OR assigned_to = their own id
*/

-- Exam sessions table
CREATE TABLE IF NOT EXISTS exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
  total_score integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_exam_sessions" ON exam_sessions;
CREATE POLICY "select_own_exam_sessions" ON exam_sessions FOR SELECT
  TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "insert_own_exam_sessions" ON exam_sessions;
CREATE POLICY "insert_own_exam_sessions" ON exam_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "update_own_exam_sessions" ON exam_sessions;
CREATE POLICY "update_own_exam_sessions" ON exam_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "delete_own_exam_sessions" ON exam_sessions;
CREATE POLICY "delete_own_exam_sessions" ON exam_sessions FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_student ON exam_sessions(student_id);

-- Exam answers table
CREATE TABLE IF NOT EXISTS exam_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id uuid NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  code_submitted text NOT NULL DEFAULT '',
  score integer,
  ai_feedback text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_exam_answers" ON exam_answers;
CREATE POLICY "select_own_exam_answers" ON exam_answers FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_answers.exam_session_id
      AND exam_sessions.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_exam_answers" ON exam_answers;
CREATE POLICY "insert_own_exam_answers" ON exam_answers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_answers.exam_session_id
      AND exam_sessions.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_exam_answers" ON exam_answers;
CREATE POLICY "update_own_exam_answers" ON exam_answers FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_answers.exam_session_id
      AND exam_sessions.student_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_answers.exam_session_id
      AND exam_sessions.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_exam_answers" ON exam_answers;
CREATE POLICY "delete_own_exam_answers" ON exam_answers FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_answers.exam_session_id
      AND exam_sessions.student_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_exam_answers_session ON exam_answers(exam_session_id);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  assigned_to text NOT NULL DEFAULT 'all' CHECK (assigned_to IN ('all') OR assigned_to !~ '^[0-9a-f]{8}-'),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT chk_assignment_target CHECK (
    assigned_to = 'all' OR student_id IS NOT NULL
  )
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own assignments
DROP POLICY IF EXISTS "select_own_assignments_teacher" ON assignments;
CREATE POLICY "select_own_assignments_teacher" ON assignments FOR SELECT
  TO authenticated USING (auth.uid() = teacher_id OR assigned_to = 'all' OR student_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_assignments" ON assignments;
CREATE POLICY "insert_own_assignments" ON assignments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "delete_own_assignments" ON assignments;
CREATE POLICY "delete_own_assignments" ON assignments FOR DELETE
  TO authenticated USING (auth.uid() = teacher_id);

CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
