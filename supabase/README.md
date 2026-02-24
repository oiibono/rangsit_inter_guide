# Supabase setup

## Running the migration

1. Open your [Supabase](https://supabase.com) project.
2. Go to **SQL Editor** and create a new query.
3. Copy the contents of `migrations/20250211000000_initial_schema.sql` and run it.

This creates:

- `international_programs`, `clubs`, `announcements` tables
- `user_roles` table (links auth users to `admin` or `club_admin` and optional `club_id`)
- Row Level Security (RLS) so:
  - **Admin**: full access to all tables
  - **Club admin**: only their club’s announcements (read/insert/update/delete by `club_id`)

## Adding admin and club admin users

After users sign up via your app (or you create them in **Authentication > Users**), grant roles in the SQL Editor:

**Make a user a full admin:**

```sql
insert into public.user_roles (user_id, role)
values ('<paste-user-uuid-from-auth-users>', 'admin');
```

**Make a user a club admin** (they will only see and manage announcements for that club):

```sql
insert into public.user_roles (user_id, role, club_id)
values ('<paste-user-uuid-from-auth-users>', 'club_admin', 1);
```

Use the correct `club_id` from your `clubs` table. Each user should have at most one row in `user_roles`.
