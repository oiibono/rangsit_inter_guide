# Rangsit Inter Guide

A school/university admin dashboard for Rangsit University. Public visitors see announcements, clubs, canteen, shuttle bus, and international programs. **Admins** and **club admins** sign in to manage content (announcements, club announcements, clubs, international programs) with role-based access.

---

## What this project does

- **Public site:** Home, Canteen, Announcements (general + club tabs), Clubs, Shuttle Bus, International Programs.
- **Admin** (role `admin`): Full access — manage general announcements, club announcements, clubs, and international programs. Can assign user roles.
- **Club admin** (role `club_admin`): Manages only their club’s **club announcements** (separate table from general announcements). Sees a single “Club announcements” panel.
- **Auth:** Supabase Auth; admin panel is behind login. Logout appears in the navbar for admin/club_admin.

**Backend:** Supabase (PostgreSQL, Row Level Security, Storage for uploads). See **[supabase/README.md](./supabase/README.md)** for schema, migrations, storage, and user roles.

---

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix-based components)
- **React Router** for routes
- **Supabase JS** (Auth, Database, Storage)
- **TanStack Query**, **Lucide** icons

---

## Project structure

```
rangsit-connect-react-main/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Routes and global providers
│   ├── index.css                # Global + Tailwind
│   │
│   ├── pages/                   # Route-level pages
│   │   ├── Index.tsx            # Home
│   │   ├── Announcements.tsx    # Public announcements (general + club tabs)
│   │   ├── AnnouncementsPage.tsx # Admin: general announcements CRUD
│   │   ├── ClubAnnouncementsPage.tsx # Admin / club_admin: club_announcements CRUD
│   │   ├── AdminPanel.tsx       # Post-login panel (tabs for admin; single view for club_admin)
│   │   ├── AdminLogin.tsx       # Login page
│   │   ├── Clubs.tsx            # Public clubs list
│   │   ├── Canteen.tsx
│   │   ├── ShuttleBus.tsx
│   │   ├── InternationalPrograms.tsx
│   │   └── NotFound.tsx
│   │
│   ├── components/              # Reusable UI and feature components
│   │   ├── Layout.tsx           # Wraps app with Navigation
│   │   ├── Navigation.tsx       # Sidebar + mobile nav; Admin/Logout when signed in
│   │   ├── Footer.tsx
│   │   ├── ProtectedRoute.tsx   # Redirects to login if not authenticated
│   │   ├── ManageClubs.tsx      # Admin: clubs CRUD
│   │   ├── ManageInternationalPrograms.tsx # Admin: international programs CRUD
│   │   ├── ManageAnnouncements.tsx # Legacy; admin uses AnnouncementsPage
│   │   ├── Hero.tsx, QuickLinks.tsx, AdministrationProcess.tsx
│   │   └── ui/                  # shadcn components (button, card, dialog, table, etc.)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx      # Auth state
│   ├── hooks/
│   │   └── useUserRole.ts       # Fetches role + club_id from user_roles
│   └── lib/
│       ├── supabase.ts          # Supabase client
│       └── utils.ts
│
├── supabase/                    # Database and storage setup
│   ├── README.md                # Supabase setup (schema, storage, user roles)
│   ├── full_schema.sql          # One-shot full schema
│   ├── club_announcements.sql   # club_announcements table + RLS
│   ├── fix_announcements_created_by.sql
│   ├── run_in_supabase.sql
│   ├── add_user_role.sql
│   └── migrations/              # Individual migrations
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md                    # This file
```

### Routes (from `App.tsx`)

| Path | Page | Access |
|------|------|--------|
| `/` | Home | Public |
| `/announcements` | Announcements (general + club tabs) | Public |
| `/clubs` | Clubs | Public |
| `/canteen` | Canteen | Public |
| `/shuttle-bus` | Shuttle Bus | Public |
| `/international-programs` | International Programs | Public |
| `/admin-login` | Login | Public |
| `/admin-panel` | Admin panel (announcements, club announcements, clubs, international programs) | Authenticated; content by role |

---

## Run locally

**Requirements:** Node.js and npm.

```bash
# Clone and enter the project
git clone <YOUR_GIT_URL>
cd rangsit-connect-react-main

# Install dependencies
npm install

# Environment: create .env (or .env.local) with your Supabase keys
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start dev server
npm run dev
```

Then open the URL shown (e.g. `http://localhost:5173`).  
**Backend:** Configure the database and storage using **[supabase/README.md](./supabase/README.md)** (run schema, create `announcements` bucket and make it public, add admin/club_admin users).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Editing and deployment

- **Lovable:** [Open the Lovable project](https://lovable.dev/projects/c6b295eb-e526-4c25-98db-b18e7e5f661d) to edit via the UI; changes sync to this repo.
- **IDE:** Clone, edit locally, and push; pushed changes appear in Lovable.
- **Deploy:** In Lovable, use **Share → Publish**.
- **Custom domain:** Lovable → Project → Settings → Domains → Connect Domain.

---

## Summary

| Topic | Where to look |
|-------|----------------|
| App routes and UI | `src/App.tsx`, `src/pages/`, `src/components/` |
| Auth and roles | `src/hooks/useUserRole.ts`, `src/contexts/AuthContext.tsx`, `src/components/ProtectedRoute.tsx` |
| Database, RLS, storage, user roles | **[supabase/README.md](./supabase/README.md)** |
