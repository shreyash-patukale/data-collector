# 🌱 HydroTrack — Hydroponic Data Logger PWA

A production-ready Progressive Web App for logging TDS and pH readings across hydroponic crop iterations.

## Features

- **Employee Interface** — Log TDS/pH readings, manage iterations
- **Admin Panel** — Full data visibility, delete/reopen iterations, user management
- **PWA** — Installable on mobile home screen, offline fallback
- **Push Notifications** — Automatic reminders every 2 days via Firebase FCM
- **Supabase Auth + RLS** — Secure role-based access control

## Tech Stack

| Layer    | Technology         |
|----------|--------------------|
| Frontend | Next.js 14 (App Router) + React + TailwindCSS |
| Backend  | Supabase (Postgres + Auth + RLS) |
| Push     | Firebase Cloud Messaging |
| Hosting  | Vercel |
| PWA      | next-pwa |

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase + Firebase credentials
npm run dev
```

## Full Setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete step-by-step production deployment instructions.

## Database Schema

See [supabase-schema.sql](./supabase-schema.sql) for the full schema with RLS policies.
