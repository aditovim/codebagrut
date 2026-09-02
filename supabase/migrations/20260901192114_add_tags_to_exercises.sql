/*
# Add tags column to exercises table

1. New Columns
- `exercises.tags` (jsonb, nullable, defaults to '[]') — array of tag strings in Hebrew, e.g. ["לולאות", "מערכים"]

2. Notes
- The `difficulty` column already exists with a CHECK constraint allowing 'beginner', 'intermediate', 'advanced'.
- No RLS policy changes needed — existing policies on exercises already cover all CRUD operations.
- This migration is idempotent: uses DO block to check column existence before adding.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exercises' AND column_name = 'tags'
  ) THEN
    ALTER TABLE exercises ADD COLUMN tags jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;
