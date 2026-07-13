# HAID Watch — Phase 1

Community Transparency & Election Incident Reporting Platform.

This is the Phase 1 scaffold: homepage, incident reporting form, and a public
map of published reports. Built with Next.js (App Router), Supabase
(Postgres + storage), and Leaflet/OpenStreetMap.

## 1. Create accounts (one-time)

1. **GitHub** — create a new empty repo, e.g. `haid-watch`.
2. **Supabase** — https://supabase.com → New Project. Note your project URL
   and anon key from Settings → API.
3. **Vercel** — https://vercel.com → sign up with GitHub.

## 2. Set up the database

In your Supabase project, open the SQL editor and run the contents of
`supabase/schema.sql`. This creates the `states`, `lgas`, `wards`,
`polling_units`, `incidents`, and `incident_media` tables, plus Row Level
Security policies (public can read published incidents, anyone can submit
a new one as `pending_review`).

You'll want to seed `states` / `lgas` / `wards` with real Nigerian
administrative data — this scaffold leaves that empty for now since it's a
sizeable reference dataset best imported separately.

## 3. Run locally

```bash
git clone <your-repo-url>
cd haid-watch
npm install
cp .env.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Visit http://localhost:3000

## 4. Deploy to Vercel

1. Push this code to your GitHub repo.
2. In Vercel: New Project → import the repo.
3. Add the two environment variables from `.env.local` in Vercel's project
   settings (Environment Variables).
4. Deploy. Vercel will redeploy automatically on every push to `main`.

## What's built so far

- Homepage
- Incident reporting form (title, category, description, anonymous toggle) —
  writes to Supabase, lands as `pending_review`
- Public map — reads `published` incidents with coordinates and shows them
  as markers

## What's intentionally NOT built yet (next steps)

- Location picker (State → LGA → Ward → Polling Unit dropdowns) — needs the
  reference data seeded first
- Photo/video upload to Supabase Storage
- Search and filtering UI
- Moderation dashboard (approve/reject/flag) — this needs a
  server-side-only Supabase **service role key** and should live behind
  authentication, never in the public app
- Seeding Nigeria's State/LGA/Ward/Polling Unit reference data

Good next session to tackle: the location picker + seed data, since the
reporting form and map both depend on it.
