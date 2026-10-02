import { sql } from 'drizzle-orm';
import { db } from '../src/lib/db/client.js';

// Additive migration for the admin login rate limit. Safe to run more than once.
// Run before deploying code that reads the table: `bun run scripts/create-admin-login-attempts.ts`
await db.run(sql`
    CREATE TABLE IF NOT EXISTS admin_login_attempts (
        key TEXT PRIMARY KEY,
        attempts INTEGER NOT NULL,
        window_start INTEGER NOT NULL
    )
`);

// IF NOT EXISTS does not validate an existing table, so check the columns.
const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(admin_login_attempts)`);
const names = columns.map((c) => c.name).sort();
const expected = ['attempts', 'key', 'window_start'];
if (JSON.stringify(names) !== JSON.stringify(expected)) {
    console.error('❌ admin_login_attempts has unexpected columns:', names);
    process.exit(1);
}
console.log('✅ admin_login_attempts ready:', names.join(', '));
