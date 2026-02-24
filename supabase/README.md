# Supabase setup

This folder contains SQL migrations and scripts for the Rangsit Connect app (PostgreSQL + RLS + Storage).

---

## Quick start

1. Create a project at [Supabase](https://supabase.com).
2. Run the full schema (see [Schema & migrations](#schema--migrations)).
3. Create the Storage bucket and make it public (see [Storage](#storage)).
4. Add your first admin user (see [User roles](#user-roles)).

---

## Schema & migrations

### Option A: Full schema (new project)

Run **`full_schema.sql`** in **Supabase Dashboard → SQL Editor**. It creates:

- **Tables:** `international_programs`, `clubs`, `announcements`, `club_announcements`, `user_roles`
- **RLS** (Row Level Security) and policies for all tables
- **Functions:** `current_user_role()`, `assign_user_role()`
- **Grants** for `anon` and `authenticated`

### Option B: Step-by-step (existing project)

If you already have some tables, run in order:

1. **`migrations/20250211000000_initial_schema.sql`** – base tables and RLS
2. **`fix_announcements_created_by.sql`** – add `created_by_role` and `created_by_user_id` to `announcements` (if needed)
3. **`club_announcements.sql`** – `club_announcements` table and its RLS
4. **`migrations/20250224000001_assign_user_role_function.sql`** – `assign_user_role()` so admins can assign roles from the app
5. **`run_in_supabase.sql`** – optional: list users + examples to insert into `user_roles`

### Tables overview

| Table | Purpose |
|-------|--------|
| `announcements` | General/university announcements (admin-managed; optional `club_id`) |
| `club_announcements` | Club-only announcements (club_admin for their club, admin for all) |
| `clubs` | Club list (admin-managed) |
| `international_programs` | Programs list (admin-managed) |
| `user_roles` | Links auth users to `admin` or `club_admin` and optional `club_id` |

---

## Storage

Announcement and club announcement **images/files** are stored in Supabase Storage.

### Bucket: `announcements`

1. In Supabase go to **Storage** in the sidebar.
2. If the bucket **`announcements`** does not exist, click **New bucket**, name it `announcements`, and create it.
3. Open the **announcements** bucket → **⋮** menu → **Make public** (or in Configuration, enable **Public bucket**).
4. Under **Policies**, ensure public read is allowed (e.g. “Allow public read” or a policy that allows `anon` to `SELECT`).

If the bucket stays private, image URLs from uploads will return 403 and the app will show a placeholder.

### Optional: `images` bucket

If you use **Manage Clubs** or **International Programs** with image upload, create an **`images`** bucket and make it public the same way.

---

## User roles

- **Admin:** Full access to announcements, club_announcements, clubs, international_programs. Can assign roles via `assign_user_role()` or SQL.
- **Club admin:** Can only manage their club’s rows in `club_announcements` (their `club_id` from `user_roles`).

### Get user UUID

In **SQL Editor**:

```sql
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
```

Copy the `id` (UUID) of the user you want to assign a role to.

### Add admin

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<paste-user-uuid>', 'admin');
```

### Add club admin

Replace `1` with a valid `id` from `clubs`:

```sql
INSERT INTO public.user_roles (user_id, role, club_id)
VALUES ('<paste-user-uuid>', 'club_admin', 1);
```

### Already has a role (update)

```sql
UPDATE public.user_roles
SET role = 'admin', club_id = NULL
WHERE user_id = '<user-uuid>';

-- or for club_admin:
UPDATE public.user_roles
SET role = 'club_admin', club_id = 1
WHERE user_id = '<user-uuid>';
```

---

## Environment variables

In your app (e.g. `.env` or `.env.local`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase Dashboard → **Project Settings** → **API**.

---

## File reference

| File | Use |
|------|-----|
| `full_schema.sql` | One-shot full schema (tables, RLS, functions, grants) |
| `club_announcements.sql` | Only `club_announcements` table + RLS + grants |
| `fix_announcements_created_by.sql` | Add `created_by_role` / `created_by_user_id` to `announcements` |
| `run_in_supabase.sql` | List users + commented examples for inserting into `user_roles` |
| `add_user_role.sql` | Short script: list users + insert examples for `user_roles` |
| `migrations/` | Individual migrations (initial schema, created_by columns, assign_user_role) |
