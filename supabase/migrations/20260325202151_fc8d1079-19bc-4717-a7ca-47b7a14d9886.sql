-- Harden new-user provisioning for profiles and roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  preferred_username text;
  preferred_avatar text;
BEGIN
  preferred_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    'user_' || LEFT(NEW.id::text, 8)
  );

  preferred_avatar := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'picture'), '')
  );

  INSERT INTO public.profiles (user_id, username, avatar_url)
  SELECT NEW.id, preferred_username, preferred_avatar
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = NEW.id
  );

  UPDATE public.profiles p
  SET
    username = CASE
      WHEN (LOWER(COALESCE(p.username, '')) = 'me' OR p.username LIKE 'user_%') AND preferred_username IS NOT NULL
        THEN preferred_username
      ELSE p.username
    END,
    avatar_url = COALESCE(NULLIF(TRIM(p.avatar_url), ''), preferred_avatar),
    updated_at = now()
  WHERE p.user_id = NEW.id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill missing profiles for existing auth users
INSERT INTO public.profiles (user_id, username, avatar_url)
SELECT
  u.id,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
    NULLIF(SPLIT_PART(COALESCE(u.email, ''), '@', 1), ''),
    'user_' || LEFT(u.id::text, 8)
  ) AS username,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'avatar_url'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'picture'), '')
  ) AS avatar_url
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Repair placeholder usernames / missing avatars for existing profiles
UPDATE public.profiles p
SET
  username = CASE
    WHEN LOWER(COALESCE(p.username, '')) = 'me' OR p.username LIKE 'user_%'
      THEN COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data->>'username'), ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
        NULLIF(SPLIT_PART(COALESCE(u.email, ''), '@', 1), ''),
        p.username
      )
    ELSE p.username
  END,
  avatar_url = COALESCE(
    NULLIF(TRIM(p.avatar_url), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'avatar_url'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'picture'), '')
  ),
  updated_at = now()
FROM auth.users u
WHERE p.user_id = u.id;

-- Backfill missing default role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::public.app_role
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_roles ur
  WHERE ur.user_id = u.id
    AND ur.role = 'user'::public.app_role
);