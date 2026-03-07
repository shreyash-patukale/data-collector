# HydroTrack — Complete Production Setup Guide

## Prerequisites
- Node.js 18+ installed
- Git installed
- Accounts on: Supabase, Firebase, Vercel

---

## STEP 1 — Clone & Install

```bash
git clone https://github.com/your-org/hydroponic-pwa
cd hydroponic-pwa
npm install
cp .env.example .env.local
```

---

## STEP 2 — Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **New project**
3. Fill in:
   - **Name**: HydroTrack
   - **Database password**: (save this securely)
   - **Region**: Choose closest to your team
4. Wait ~2 minutes for provisioning

### Get your keys:
- Go to **Settings → API**
- Copy:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep secret!)*

---

## STEP 3 — Run SQL Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run**

You should see:
- ✅ Tables created: `users`, `setups`, `iterations`, `readings`
- ✅ Triggers created
- ✅ RLS policies applied
- ✅ Sample setups inserted

---

## STEP 4 — Configure Supabase Auth

1. Go to **Authentication → Settings**
2. Under **Email**, enable **Email/Password** sign-in
3. Disable **Email confirmations** (for internal tool simplicity) OR keep enabled for security
4. Under **URL Configuration**, set:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

### Create Admin User:
1. Go to **Authentication → Users → Add user**
2. Enter admin email & password
3. Then in **SQL Editor**, run:
```sql
UPDATE public.users
SET role = 'admin', name = 'Admin Name'
WHERE email = 'admin@yourcompany.com';
```

### Create Employee Users:
```sql
-- After they sign up via the app, or insert manually:
-- First create in Auth → Users, then:
UPDATE public.users
SET name = 'Employee Name'
WHERE email = 'employee@yourcompany.com';
```

---

## STEP 5 — Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Name it **HydroTrack**
4. Disable Google Analytics (optional)
5. Click **Create project**

### Enable Cloud Messaging:

1. In project dashboard, click **Web** icon (</>) to add a web app
2. Register app with name **HydroTrack Web**
3. Copy the `firebaseConfig` object — you need all values for `.env.local`

4. Go to **Project Settings → Cloud Messaging**
5. Under **Web Push certificates**, click **Generate key pair**
6. Copy the **Key pair** value → `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### Generate Service Account (for cron notifications):

1. Go to **Project Settings → Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Copy the entire JSON content, stringify it:

```bash
cat firebase-service-account.json | tr -d '\n' > firebase-sa-minified.txt
```

5. Paste that minified JSON as `FIREBASE_SERVICE_ACCOUNT_JSON` env var

---

## STEP 6 — Fill Environment Variables

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hydrotrack-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hydrotrack-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hydrotrack-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BG...

# Server-side only
FIREBASE_PROJECT_ID=hydrotrack-xxx
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Cron secret (generate: openssl rand -base64 32)
CRON_SECRET=your-random-secret-here
```

---

## STEP 7 — Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

- You'll be redirected to `/auth/login`
- Log in with your admin credentials
- Verify the dashboard, create an iteration, add readings

---

## STEP 8 — Generate PWA Icons

You need icons in multiple sizes. Use a generator:

1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 PNG of your logo (green droplet recommended)
3. Download the generated icon pack
4. Extract icons into `public/icons/`

Required files:
```
public/icons/icon-72x72.png
public/icons/icon-96x96.png
public/icons/icon-128x128.png
public/icons/icon-144x144.png
public/icons/icon-152x152.png
public/icons/icon-192x192.png
public/icons/icon-384x384.png
public/icons/icon-512x512.png
public/icons/apple-touch-icon.png  (180x180)
public/icons/badge-72x72.png
```

---

## STEP 9 — Deploy to Vercel

### Option A: GitHub (recommended)

```bash
git add .
git commit -m "Initial production build"
git push origin main
```

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Click **Environment Variables** and add ALL vars from `.env.local`
5. Click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## STEP 10 — Configure Vercel Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add every variable from `.env.local`. Make sure `SUPABASE_SERVICE_ROLE_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` are marked as **Production** only (never expose in preview).

---

## STEP 11 — Enable Vercel Cron

The `vercel.json` already configures the cron:
```json
{
  "crons": [{ "path": "/api/cron/reminder", "schedule": "0 9 */2 * *" }]
}
```

This runs every 2 days at 9am UTC.

In Vercel dashboard → Your Project → Settings → Cron Jobs:
- Verify the cron job appears
- You can trigger it manually to test

**Important**: The cron job uses `CRON_SECRET` for security. When Vercel runs it, it sends `Authorization: Bearer <CRON_SECRET>` in the header.

---

## STEP 12 — Configure Firebase Service Worker

The file `public/firebase-messaging-sw.js` needs your actual Firebase config values. Replace the placeholder strings:

```javascript
// In public/firebase-messaging-sw.js, update:
firebase.initializeApp({
  apiKey:            'YOUR_ACTUAL_API_KEY',
  authDomain:        'YOUR_ACTUAL_AUTH_DOMAIN',
  projectId:         'YOUR_ACTUAL_PROJECT_ID',
  storageBucket:     'YOUR_ACTUAL_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_ACTUAL_SENDER_ID',
  appId:             'YOUR_ACTUAL_APP_ID',
});
```

> Note: These values are public (same as NEXT_PUBLIC_ vars) so hardcoding them in the service worker is safe.

---

## STEP 13 — Test PWA Installation

1. Open your deployed URL in Chrome on Android
2. Tap the browser menu → **Add to Home Screen**
3. Accept — the app icon should appear on your home screen
4. Launch from home screen — it should open in standalone mode (no browser chrome)

On iOS Safari:
1. Tap **Share** → **Add to Home Screen**
2. Accept

---

## STEP 14 — Test Push Notifications

1. Log in as an employee
2. Click "Enable alerts" in the top bar
3. Accept the browser notification permission
4. Your FCM token is now stored

Test manually by calling the cron endpoint:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/reminder
```

You should receive a push notification on enrolled devices.

---

## STEP 15 — Add More Employees

For each new employee:

1. Go to Supabase → Authentication → Users → **Add user**
2. Enter their email and a temporary password
3. Share credentials with the employee
4. They log in and change their password via **Account settings**

Or employees can be invited via email if you enable Supabase invites.

---

## Production Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed client-side
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` marked server-only in Vercel
- [ ] `CRON_SECRET` is a strong random value
- [ ] RLS enabled on all Supabase tables (verified via Schema → Tables → RLS badge)
- [ ] Admin route `/admin` tested with employee account (should redirect to /dashboard)
- [ ] Email confirmations enabled in Supabase Auth (for non-internal deployments)
- [ ] Custom domain configured in Vercel (optional)
- [ ] Supabase database daily backups enabled (Pro plan)

---

## Project Structure Summary

```
hydroponic-pwa/
├── app/
│   ├── layout.tsx                     # Root layout + fonts
│   ├── page.tsx                       # Redirect to /dashboard
│   ├── offline/page.tsx               # PWA offline fallback
│   ├── auth/login/page.tsx            # Login page
│   ├── dashboard/
│   │   ├── layout.tsx                 # Auth guard + nav
│   │   ├── page.tsx                   # Dashboard (iterations list)
│   │   └── iterations/
│   │       ├── new/page.tsx           # Create iteration
│   │       └── [id]/page.tsx          # Iteration detail + readings
│   ├── admin/
│   │   ├── layout.tsx                 # Admin guard
│   │   └── page.tsx                   # Admin panel
│   └── api/cron/reminder/route.ts     # Push notification cron
├── components/
│   ├── dashboard/
│   │   ├── TopBar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── IterationCard.tsx
│   │   └── IterationDetail.tsx
│   ├── forms/
│   │   ├── CreateIterationForm.tsx
│   │   ├── AddReadingModal.tsx
│   │   └── CloseIterationModal.tsx
│   └── admin/
│       └── AdminPanel.tsx
├── lib/
│   ├── types.ts                       # TypeScript types
│   ├── supabase-client.ts             # Browser Supabase client
│   ├── supabase-server.ts             # Server Supabase client
│   └── firebase.ts                    # FCM setup
├── hooks/
│   ├── useAuth.ts
│   └── useNotifications.ts
├── services/
│   ├── iterations.ts
│   └── setups.ts
├── utils/helpers.ts
├── styles/globals.css
├── public/
│   ├── manifest.json                  # PWA manifest
│   ├── firebase-messaging-sw.js       # Background push handler
│   └── icons/                         # PWA icons (add your own)
├── supabase-schema.sql                # Complete DB schema + RLS
├── vercel.json                        # Cron configuration
├── next.config.js                     # PWA config
├── tailwind.config.ts
└── .env.example
```

---

## Troubleshooting

**Login not working**
→ Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

**"Permission denied" when creating iteration**
→ Check RLS policies are applied. Re-run the schema SQL.

**Push notifications not received**
→ Ensure `firebase-messaging-sw.js` has the correct Firebase config values (not placeholders)

**Cron job not sending notifications**
→ Check Vercel function logs. Verify `CRON_SECRET` matches in vercel.json and env vars.

**Admin panel accessible by employees**
→ RLS on the `users` table should prevent this. Verify the admin layout redirect is working.

**App not installable as PWA**
→ Verify `manifest.json` is served at `/manifest.json` and all icon files exist in `public/icons/`
