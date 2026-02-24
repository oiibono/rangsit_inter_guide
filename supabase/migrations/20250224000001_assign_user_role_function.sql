-- ============================================================
-- Allow admins to assign user roles from the app (avoids RLS/uid errors)
-- Run in Supabase SQL Editor if not using migrations
-- ============================================================

create or replace function public.assign_user_role(
  target_user_id uuid,
  new_role text,
  new_club_id bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  is_caller_admin boolean;
begin
  -- Only existing admins can assign roles
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ) into is_caller_admin;

  if not is_caller_admin then
    return jsonb_build_object('success', false, 'error', 'Only admins can assign roles');
  end if;

  if new_role not in ('admin', 'club_admin') then
    return jsonb_build_object('success', false, 'error', 'Invalid role');
  end if;

  if new_role = 'club_admin' and new_club_id is null then
    return jsonb_build_object('success', false, 'error', 'club_id required for club_admin');
  end if;

  -- Upsert: insert or update
  insert into public.user_roles (user_id, role, club_id)
  values (target_user_id, new_role, case when new_role = 'admin' then null else new_club_id end)
  on conflict (user_id) do update
  set role = excluded.role, club_id = excluded.club_id;

  return jsonb_build_object('success', true);
exception
  when others then
    return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

comment on function public.assign_user_role(uuid, text, bigint) is 'Allows an admin to assign or update a user role. Call from app with target user UUID.';

-- Grant execute to authenticated users (function checks admin inside)
grant execute on function public.assign_user_role(uuid, text, bigint) to authenticated;
