# Supabase setup

## Storage: make images load (announcements & club_announcements)

For announcement and club announcement images to show, the Storage bucket must be **public**:

1. In Supabase go to **Storage** in the sidebar.
2. If the bucket **`announcements`** does not exist, click **New bucket**, name it `announcements`, and create it.
3. Open the **announcements** bucket → click the **⋮** menu → **Make public** (or in Configuration, enable **Public bucket**).
4. Under **Policies**, ensure there is a policy that allows **public read** (e.g. `SELECT` for `anon`), or rely on “Make public” which does this.

If the bucket stays private, image URLs from uploads will return 403 and the app will show a placeholder instead.

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
