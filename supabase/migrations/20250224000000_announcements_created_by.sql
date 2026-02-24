-- ============================================================
-- Announcements: track who created (admin vs club_admin)
-- Run in Supabase SQL Editor if not using migrations
-- ============================================================

-- Add columns to announcements (nullable for existing rows)
alter table public.announcements
  add column if not exists created_by_role text null
    check (created_by_role in ('admin', 'club_admin'));

alter table public.announcements
  add column if not exists created_by_user_id uuid null
    references auth.users (id) on delete set null;

comment on column public.announcements.created_by_role is 'Role of the user who created this announcement.';
comment on column public.announcements.created_by_user_id is 'Auth user id of the creator (optional).';
