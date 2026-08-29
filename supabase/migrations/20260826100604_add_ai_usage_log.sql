/*
# Add ai_usage_log table for rate limiting AI calls

## Purpose
Track every call to the review-code and ai-tutor Edge Functions so the
functions can count calls per user per hour and reject excessive usage
(20 calls/hour) with a 429 response — protecting the Anthropic API budget.

## New table: ai_usage_log
- id (uuid PK)
- user_id (uuid, references auth.users, NOT NULL)
- function_name (text, NOT NULL) — 'review-code' or 'ai-tutor'
- created_at (timestamptz, default now())

## Security
- RLS enabled
- Students can only SELECT/INSERT their own rows (user_id = auth.uid())
- No UPDATE or DELETE from the client — edge functions use the service role
  key which bypasses RLS, so the functions can insert freely
- Index on (user_id, created_at) for the hourly count query
*/

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_usage" ON ai_usage_log;
CREATE POLICY "select_own_ai_usage" ON ai_usage_log FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_usage" ON ai_usage_log;
CREATE POLICY "insert_own_ai_usage" ON ai_usage_log FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_time ON ai_usage_log(user_id, created_at);
