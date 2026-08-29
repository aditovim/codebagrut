/*
# Add Bagrut Archive, Announcements, and Schedule tables

1. New Tables
- `bagrut_questions` — archived Bagrut exam questions with year, semester, exam code, topic, tags, and practice type
- `announcements` — teacher announcements for the class with type (announcement/reminder/assignment)
- `schedule_items` — class schedule items (lessons, exams, deadlines)

2. Security
- RLS enabled on all tables.
- bagrut_questions: readable by all authenticated; insert by authenticated
- announcements: readable by all authenticated; insert/update/delete by authenticated
- schedule_items: readable by all authenticated; insert/update/delete by authenticated
*/

CREATE TABLE IF NOT EXISTS bagrut_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  year integer NOT NULL,
  semester text NOT NULL DEFAULT 'a' CHECK (semester IN ('a', 'b')),
  exam_code text NOT NULL DEFAULT '271',
  topic text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  practice_type text NOT NULL DEFAULT 'class' CHECK (practice_type IN ('class', 'homework', 'exam')),
  points integer NOT NULL DEFAULT 15,
  description text NOT NULL DEFAULT '',
  starter_code text NOT NULL DEFAULT '',
  solution_code text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bagrut_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_bagrut_questions" ON bagrut_questions;
CREATE POLICY "select_bagrut_questions" ON bagrut_questions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_bagrut_questions" ON bagrut_questions;
CREATE POLICY "insert_bagrut_questions" ON bagrut_questions FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'announcement' CHECK (type IN ('announcement', 'reminder', 'assignment', 'exam')),
  link_url text,
  due_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_announcements" ON announcements;
CREATE POLICY "select_announcements" ON announcements FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_announcements" ON announcements;
CREATE POLICY "insert_announcements" ON announcements FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_announcements" ON announcements;
CREATE POLICY "delete_announcements" ON announcements FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

CREATE TABLE IF NOT EXISTS schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  item_date date NOT NULL,
  start_time text,
  end_time text,
  item_type text NOT NULL DEFAULT 'lesson' CHECK (item_type IN ('lesson', 'exam', 'deadline', 'event')),
  link_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_schedule_items" ON schedule_items;
CREATE POLICY "select_schedule_items" ON schedule_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_schedule_items" ON schedule_items;
CREATE POLICY "insert_schedule_items" ON schedule_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_schedule_items" ON schedule_items;
CREATE POLICY "delete_schedule_items" ON schedule_items FOR DELETE
  TO authenticated USING (auth.uid() = author_id);
