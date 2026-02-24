-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor (one-time setup + add roles)
-- ============================================================

-- ---------------------------------------------------------------------------
-- 1. Announcements: track created by admin vs club_admin
-- ---------------------------------------------------------------------------
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS created_by_role text NULL
    CHECK (created_by_role IN ('admin', 'club_admin'));

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid NULL
    REFERENCES auth.users (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.announcements.created_by_role IS 'Role of the user who created this announcement.';
COMMENT ON COLUMN public.announcements.created_by_user_id IS 'Auth user id of the creator.';


-- ---------------------------------------------------------------------------
-- 2. Function: allow admins to assign roles from the app (fixes uid/RLS errors)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id uuid,
  new_role text,
  new_club_id bigint DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_caller_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO is_caller_admin;

  IF NOT is_caller_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can assign roles');
  END IF;

  IF new_role NOT IN ('admin', 'club_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role');
  END IF;

  IF new_role = 'club_admin' AND new_club_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'club_id required for club_admin');
  END IF;

  INSERT INTO public.user_roles (user_id, role, club_id)
  VALUES (target_user_id, new_role, CASE WHEN new_role = 'admin' THEN NULL ELSE new_club_id END)
  ON CONFLICT (user_id) DO UPDATE
  SET role = excluded.role, club_id = excluded.club_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', sqlerrm);
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, text, bigint) TO authenticated;


-- ---------------------------------------------------------------------------
-- 3. List users (run this to get UUIDs for Step 4)
-- ---------------------------------------------------------------------------
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;


-- ---------------------------------------------------------------------------
-- 4. Add first admin (run AFTER Step 3: replace PASTE-USER-UUID-HERE with real id)
-- ---------------------------------------------------------------------------
-- You must run Step 3 first, copy the "id" of the user who should be admin, then run ONE of:

-- Make user an ADMIN:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('PASTE-USER-UUID-HERE', 'admin');

-- Make user a CLUB_ADMIN (replace 1 with your club id):
-- INSERT INTO public.user_roles (user_id, role, club_id)
-- VALUES ('PASTE-USER-UUID-HERE', 'club_admin', 1);

-- If you get "duplicate key": user already has a role. Update instead:
-- UPDATE public.user_roles SET role = 'admin', club_id = NULL WHERE user_id = 'PASTE-USER-UUID-HERE';
-- UPDATE public.user_roles SET role = 'club_admin', club_id = 1 WHERE user_id = 'PASTE-USER-UUID-HERE';
