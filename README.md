# Interactive Laptop Tutorial

Svelte 5 educational platform for teaching elderly users Windows 11 skills.

## Features

- 🔐 Simple username-based authentication with **HMAC-signed session cookies** (tamper-proof; `SESSION_SECRET` required in production) and redirect-after-login (deep links survive the login step)
- 📱 Device-aware onboarding — auto-*detects* the user's device (Windows/Mac/Android/iPhone) as a hint and asks them to confirm which device they want to learn (`preferredDevice`), the enabling layer for per-device content tracks (see `docs/ROADMAP.md`)
- 🔗 Deep-linkable lessons — every lesson has its own URL (`/modules/<module>/<lessonKey>`), shareable and bookmarkable
- 📚 Library ↔ lesson bridge — theory subsections can link straight to the matching interactive lesson
- 🗂️ Device-aware module categories on the home page («Windows υπολογιστής», «Κινητό τηλέφωνο»…) + labelled Θεωρία/Εξάσκηση sub-sections inside long modules (see `docs/CURRICULUM_PLAN.md`)
- 📞 Realistic phone simulator (`mobile-sim`) — Android/iOS home screen with dock & wallpaper, goal-driven mini-apps (Τηλέφωνο με πληκτρολόγιο+Επαφές, Μηνύματα/Viber, Ρυθμίσεις με μέγεθος γραμμάτων & Wi-Fi); Android/iPhone tracks με 7 μαθήματα το καθένα (dev playground: `/demo/mobile-sim`)
- 🛡️ Admin Panel for content management
- 📊 Per-user progress tracking
- 🧩 Dynamic Lesson System (Drag & Drop, Click, Hover, Quiz, etc.)
- 🎣 Phishing & scam-recognition module with "Scam or Not?" (`scam-spotter`) exercises — 28 realistic Greek scenarios across 4 channels (email, SMS, Viber/messaging, phone/vishing) with per-signal explanations
- 🎯 Multi-level difficulty system (Beginner/Intermediate/Advanced)
- 🌍 Bilingual support (English/Greek) via inlang
- 💾 SQLite database (local dev + Turso for production)
- 🎨 Beautiful UI with shadcn-svelte components

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Initialize Database

```bash
# Generate schema and create local.db
bun run db:init
```

### 3. Run Development Server

```bash
bun run dev
```

Navigate to `http://localhost:5173` and login with any username (e.g., `user01`)

### 4. Access Admin Panel

Navigate to `http://localhost:5173/admin/login`
Password: `admin123` (configurable in `.env`)

Features:
- Enable/Disable lessons
- Seed database with default lessons
- View statistics

## Database Scripts

```bash
bun run db:generate  # Generate migration files
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio to view/edit data
bun run db:init      # Full initialization (generate + push)
```

> **Provisioning uses `db:push`, not migrations.** The schema is applied by
> diffing `src/lib/db/schema.ts` against the database with `drizzle-kit push`
> (see `scripts/init-db.sh`). The `drizzle/` migration files are gitignored
> advisory artifacts and are **not** a complete history — e.g. `db:generate`
> re-emits `CREATE TABLE modules` because that table was only ever provisioned
> via push. Treat `schema.ts` + `db:push` as the source of truth. When adding a
> column, run `db:push` against every target database (local **and** Turso).

## Development

- Adding a new module/lesson? See **[docs/i18n-guide.md](docs/i18n-guide.md)** for the i18n key workflow.
- Uses **local SQLite** (`local.db`) for development
- All user progress saved locally
- Database can be viewed with `bun run db:studio`

## Production Deployment (Vercel)

### 1. Create Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create laptop-tutorial

# Get database URL
turso db show laptop-tutorial --url

# Create auth token
turso db tokens create laptop-tutorial
```

### 2. Set Environment Variables in Vercel

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token-here
NODE_ENV=production
```

### 3. Push Schema to Turso

```bash
# Set environment variables locally for migration
export TURSO_DATABASE_URL="your-url"
export TURSO_AUTH_TOKEN="your-token"

# Push schema
bun run db:push
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

## Tech Stack

- **Framework**: SvelteKit + Svelte 5 (runes)
- **Database**: SQLite (better-sqlite3) + Turso (production)
- **ORM**: Drizzle ORM
- **UI**: shadcn-svelte + Tailwind CSS v4
- **i18n**: inlang/paraglide
- **Package Manager**: bun

## Project Structure

```
src/
├── lib/
│   ├── db/
│   │   ├── schema.ts      # Database schema
│   │   └── client.ts      # DB connection (dev/prod)
│   ├── server/
│   │   └── auth.ts        # Authentication logic
│   ├── components/
│   │   └── ui/            # shadcn components
│   ├── appState.svelte.ts # Global state (Svelte 5 runes)
│   └── types.ts           # TypeScript types
├── routes/
│   ├── login/             # Login page
│   ├── api/auth/          # Auth API endpoints
│   └── +page.svelte       # Home page
└── hooks.server.ts        # Auth + i18n middleware

messages/
├── en.json                # English translations
└── el.json                # Greek translations
```

## Development Workflow (TDD)

1. Write test first
2. Run test (should fail)
3. Write minimal code to pass
4. Refactor
5. Repeat

Tests:
```bash
bun run test          # All tests
bun run test:unit     # Vitest unit tests
bun run test:e2e      # Playwright e2e tests
```

## Παρουσιάσεις ΚΑΠΗ (offline)

Αυτόνομες παρουσιάσεις για διδασκαλία σε ΚΑΠΗ — λειτουργούν **χωρίς ίντερνετ** (`file://`),
σε οποιοδήποτε mini PC, με διπλό κλικ.

- `static/kapi/index.html` — launcher με τα 4 μαθήματα
- `static/kapi/mathima-1..6.html` — 6 ξεχωριστές, αναλυτικές παρουσιάσεις (μία ανά μάθημα: 1-4 υπολογιστής, 5-6 κινητό)
- `static/kapi/start-minipc.bat` / `static/kapi/start-minipc.sh` — άνοιγμα σε πλήρη οθόνη (kiosk)
- `static/slides-kapi.html` — σύνοψη «4 σε 1»

Επεξεργασία περιεχομένου: άλλαξε το `scripts/build-kapi-slides.mjs` και ξανατρέξε:

```bash
node scripts/build-kapi-slides.mjs   # ξαναχτίζει static/kapi/*.html
```

## License

MIT
