# Menu

A single-restaurant digital QR menu with a bilingual (EN/TR) public menu and an admin panel for managing categories, items, images, ordering, prices, and allergens — backed by Supabase.

## Stack

- Vue 3 + Vite + TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage) — no custom backend, the app talks to Supabase directly
- vue-i18n (EN default, TR)

## Setup

### 1. Create a Supabase project

Create a new project at [supabase.com](https://supabase.com/dashboard).

### 2. Run the schema migration

Open the SQL Editor in your Supabase project dashboard, paste the contents of
[`supabase/migrations/20260820120000_init_menu_schema.sql`](supabase/migrations/20260820120000_init_menu_schema.sql), and run it.

This creates all tables (settings, categories, menu items, allergens, and their EN/TR translations), row-level security policies (public read of active content, writes restricted to authenticated users), and three public storage buckets: `category-images`, `menu-item-images`, `branding`.

If you install the [Supabase CLI](https://supabase.com/docs/guides/cli) later, you can instead run `supabase link` and `supabase db push` to apply migrations from this folder directly.

### 3. Create the admin user

In the dashboard, go to **Authentication → Users → Add user** and create one user with an email/password. This is the single admin login for `/admin`. There is no public sign-up.

### 4. Configure env vars

```
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API** in your Supabase dashboard.

### 5. Install and run

```
npm install
npm run dev
```

- Public menu: `/`
- Admin panel: `/admin` (redirects to `/admin/login` if not signed in)

The `restaurant_settings` row (name, subtitle, logo, currency) starts with placeholder values — set them from **Admin → Settings** after logging in, then add categories and items.

## Build

```
npm run build
```

Outputs a static SPA in `dist/`, deployable to any static host (Vercel, Netlify, Cloudflare Pages, etc.). No server runtime is needed.
