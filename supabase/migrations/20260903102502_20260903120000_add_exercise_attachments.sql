/*
# Add exercise attachment support

1. Schema
- Add `attachment_url` (text, nullable) to `exercises` table.
  Stores the public URL of an uploaded reference file (PDF or image)
  that teachers attach to exercises for students to view.

2. Storage bucket
- Create `exercise-attachments` bucket (public read, teacher-only write).
- The bucket is public so students can open attachment URLs without
  additional auth headers.

3. Storage RLS policies
- SELECT (read): any authenticated user can read files — students
  need to open attachments for exercises they're practicing.
- INSERT (upload): only verified teachers can upload files.
- UPDATE: only verified teachers can modify files.
- DELETE: only verified teachers can remove files.

A "verified teacher" is defined as a user whose profiles.role = 'teacher'.
*/

-- 1. Add attachment_url column
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS attachment_url text;

-- 2. Create storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-attachments', 'exercise-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policies
-- Read: any authenticated user
DROP POLICY IF EXISTS "read_exercise_attachments" ON storage.objects;
CREATE POLICY "read_exercise_attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exercise-attachments');

-- Upload: teachers only
DROP POLICY IF EXISTS "upload_exercise_attachments" ON storage.objects;
CREATE POLICY "upload_exercise_attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exercise-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'teacher'
  )
);

-- Update: teachers only
DROP POLICY IF EXISTS "update_exercise_attachments" ON storage.objects;
CREATE POLICY "update_exercise_attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'exercise-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'teacher'
  )
);

-- Delete: teachers only
DROP POLICY IF EXISTS "delete_exercise_attachments" ON storage.objects;
CREATE POLICY "delete_exercise_attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'exercise-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'teacher'
  )
);
