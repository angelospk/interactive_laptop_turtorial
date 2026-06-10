# Interactive Laptop Tutorial

Svelte 5 educational platform for teaching elderly users Windows 11 skills.

## Features

- 🔐 Simple username-based authentication
- 🛡️ Admin Panel for content management
- 📊 Per-user progress tracking
- 🧩 Dynamic Lesson System (Drag & Drop, Click, Hover, Quiz, etc.)
- 🎣 Phishing & scam-recognition module with "Scam or Not?" (`scam-spotter`) exercises — realistic Greek email/SMS scenarios with per-signal explanations
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

## Development

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

## License

MIT
