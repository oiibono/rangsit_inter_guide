-- ============================================================
-- Fix: add created_by_role and created_by_user_id to announcements
-- Run this in Supabase SQL Editor if you get "column created_by_role does not exist"
-- ============================================================

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS created_by_role text NULL;

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL;

-- Add check constraint (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'announcements_created_by_role_check'
    AND conrelid = 'public.announcements'::regclass
  ) THEN
    ALTER TABLE public.announcements
      ADD CONSTRAINT announcements_created_by_role_check
      CHECK (created_by_role IS NULL OR created_by_role IN ('admin', 'club_admin'));
  END IF;
END $$;

COMMENT ON COLUMN public.announcements.created_by_role IS 'Role of the user who created this announcement.';
COMMENT ON COLUMN public.announcements.created_by_user_id IS 'Auth user id of the creator.';
