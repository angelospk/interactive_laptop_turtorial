import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../schema';

/**
 * In-memory test database using the libsql driver — the SAME driver production
 * uses on Turso. This replaces the old `better-sqlite3` setup, whose native
 * binding fails to build on newer Node (node-gyp / ABI mismatch) and blocked
 * every DB-backed unit test. libsql is pure-JS-friendly and works everywhere.
 *
 * All query calls are async (as on Turso), so tests must `await` their db ops.
 */

// Full schema DDL, kept in sync with src/lib/db/schema.ts. Mirrors what
// `drizzle-kit push` provisions, so tests exercise the real column set.
const SCHEMA_DDL = `
CREATE TABLE modules (
	id TEXT PRIMARY KEY,
	title_key TEXT NOT NULL,
	description_key TEXT,
	icon_name TEXT,
	order_index INTEGER NOT NULL,
	enabled INTEGER NOT NULL DEFAULT 1,
	created_at INTEGER NOT NULL
);

CREATE TABLE users (
	id TEXT PRIMARY KEY,
	username TEXT UNIQUE NOT NULL,
	display_name TEXT,
	created_at INTEGER NOT NULL,
	last_login INTEGER,
	is_admin INTEGER DEFAULT 0,
	preferred_device TEXT
);

CREATE TABLE lessons (
	id TEXT PRIMARY KEY,
	module_id TEXT NOT NULL,
	lesson_key TEXT NOT NULL,
	title_key TEXT NOT NULL,
	description_key TEXT,
	difficulty TEXT NOT NULL CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
	order_index INTEGER NOT NULL,
	lesson_type TEXT NOT NULL,
	config TEXT,
	enabled INTEGER NOT NULL DEFAULT 1,
	required_lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,
	created_at INTEGER NOT NULL,
	UNIQUE(module_id, lesson_key)
);

CREATE TABLE user_progress (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
	completed INTEGER NOT NULL DEFAULT 0,
	completed_at INTEGER,
	score INTEGER,
	stars INTEGER,
	attempts INTEGER NOT NULL DEFAULT 0,
	last_attempt_at INTEGER,
	UNIQUE(user_id, lesson_id)
);

CREATE TABLE lesson_views (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
	first_viewed_at INTEGER NOT NULL,
	UNIQUE(user_id, lesson_id)
);
`;

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

/** Fresh in-memory DB with the full schema applied. Call in `beforeEach`. */
export async function createTestDb(): Promise<TestDb> {
	const client = createClient({ url: ':memory:' });
	await client.executeMultiple(SCHEMA_DDL);
	return drizzle(client, { schema });
}
