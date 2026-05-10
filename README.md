# KŌDO — Workout Tracker

Dark, warm, editorial. Quiet luxury for serious training.

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/migrations/001_initial.sql`
3. Then run `supabase/seed.sql` to load the 50 default exercises
4. Enable Google OAuth in Authentication → Providers → Google
5. Set the redirect URL to `http://localhost:3000/auth/callback` (dev) and your production URL

### 2. Web app

```bash
cd apps/web
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

### 3. Mobile app

```bash
cd apps/mobile
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run start
```

## Architecture

```
kodo/
├── apps/
│   ├── web/          Next.js 14 — full web app
│   └── mobile/       Expo (React Native) — iOS + Android
├── packages/
│   ├── types/        Shared TypeScript types
│   ├── hooks/        useWeightUnit() and shared React hooks
│   └── utils/        calcNextTargetKg, buildWeeklyVolume, etc.
└── supabase/
    ├── migrations/   001_initial.sql — full schema with RLS
    └── seed.sql      50 default exercises
```

## Weight unit system

- **All weights stored in kg** in Postgres — never lbs
- `useWeightUnit(unit)` from `@kodo/hooks` handles conversion everywhere
- `display(kg)` → formatted string for display
- `toKg(val)` → converts user input back to kg for storage
- Changing the setting in Settings re-renders all values instantly

## Design tokens (Tailwind)

| Token | Hex | Use |
|-------|-----|-----|
| `obsidian` | `#0D0C0A` | Page background |
| `cave` | `#1A1814` | Card background |
| `stone` | `#2C2820` | Elevated surfaces |
| `pit` | `#232017` | Input background |
| `dust` | `#6B6355` | Muted text |
| `linen` | `#E8E0D0` | Primary text |
| `gold` | `#C4A064` | CTAs, completed, active |
| `cenote` | `#5DCAA5` | PRs, positive progress |
