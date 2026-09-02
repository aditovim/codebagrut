/*
# Set aditovim as teacher + add auto-profile-creation trigger

1. Data fix
- The user aditovim@gmail.com (auth.users id 85c70d18-ba9b-4d51-beba-eb93373d0b50)
  exists in auth.users but has NO row in profiles, causing foreign key errors
  and a broken experience (no role, no profile loaded).
- Insert a profiles row with role='teacher' for this user.

2. Auto-profile trigger
- Add a trigger on auth.users that automatically creates a profiles row
  when a new user signs up (INSERT into auth.users).
- This prevents the "no profile" / foreign key error scenario for ALL future
  registrations, even if the client-side insert fails or is skipped.
- The trigger function is SECURITY DEFINER so it can write to profiles
  regardless of RLS. It inserts with role='student' (the default).
- Uses ON CONFLICT (id) DO NOTHING so re-runs are safe.

3. Security
- The trigger function is SECURITY DEFINER, owned by postgres, and only
  fires on INSERT to auth.users — it cannot be called directly by any role.
- REVOKE EXECUTE ensures no client can call it manually.
*/

-- 1. Create/fix profile for aditovim@gmail.com
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '85c70d18-ba9b-4d51-beba-eb93373d0b50',
  'aditovim@gmail.com',
  'aditovim',
  'teacher'
)
ON CONFLICT (id) DO UPDATE
  SET role = 'teacher', full_name = EXCLUDED.full_name, email = EXCLUDED.email;

-- 2. Auto-profile-creation trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
