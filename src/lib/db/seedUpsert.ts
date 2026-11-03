import { getTableColumns, inArray, sql, type SQL } from 'drizzle-orm';
import type { BaseSQLiteDatabase, SQLiteTable } from 'drizzle-orm/sqlite-core';
import { lessons, modules, type NewLesson, type NewModule } from './schema';
import * as schema from './schema';

/**
 * Batched seeding for the lesson and module tables (bd 20l).
 *
 * The old per-row seeding did one SELECT plus one write per row, ~682 HTTP
 * round-trips to Turso. These helpers instead do one id lookup per 500 rows and
 * write in chunks of 50 (the write chunk keeps the input order, so a lesson may
 * still reference an earlier lesson through required_lesson_id, and stays well
 * under SQLite's bound-parameter limit).
 */

// Same type as the exported `db` in ./client.ts, so the libsql drizzle handles
// (tests, scripts) fit with a cast at the call site.
type SeedDb = BaseSQLiteDatabase<'async', unknown, typeof schema>;

const SELECT_CHUNK_SIZE = 500;
const WRITE_CHUNK_SIZE = 50;

export type SeedResult = { inserted: number; existing: number };

/**
 * Seeds lessons by id.
 *
 * `update` rewrites every column except id and createdAt for rows that already
 * exist; `skip` leaves them untouched.
 */
export async function seedLessons(
	db: SeedDb,
	rows: NewLesson[],
	mode: 'update' | 'skip'
): Promise<SeedResult> {
	if (rows.length === 0) return { inserted: 0, existing: 0 };

	const existingIds = await findExistingIds(
		db,
		lessons,
		rows.map((row) => row.id)
	);
	const fresh = rows.filter((row) => !existingIds.has(row.id));

	if (mode === 'skip') {
		for (const part of chunk(fresh, WRITE_CHUNK_SIZE)) {
			await db.insert(lessons).values(part).onConflictDoNothing({ target: lessons.id }).run();
		}
	} else {
		const set = updateSetFor(lessons);
		for (const part of chunk(rows, WRITE_CHUNK_SIZE)) {
			await db.insert(lessons).values(part).onConflictDoUpdate({ target: lessons.id, set }).run();
		}
	}

	return { inserted: fresh.length, existing: rows.length - fresh.length };
}

/** Seeds modules by id, always updating the rows that already exist. */
export async function seedModules(db: SeedDb, rows: NewModule[]): Promise<SeedResult> {
	if (rows.length === 0) return { inserted: 0, existing: 0 };

	const existingIds = await findExistingIds(
		db,
		modules,
		rows.map((row) => row.id)
	);
	const set = updateSetFor(modules);

	for (const part of chunk(rows, WRITE_CHUNK_SIZE)) {
		await db.insert(modules).values(part).onConflictDoUpdate({ target: modules.id, set }).run();
	}

	return { inserted: rows.length - existingIds.size, existing: existingIds.size };
}

function chunk<T>(items: T[], size: number): T[][] {
	const parts: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		parts.push(items.slice(i, i + size));
	}
	return parts;
}

/** One SELECT per 500 ids, returning the ids that already exist. */
async function findExistingIds(
	db: SeedDb,
	table: SQLiteTable,
	ids: string[]
): Promise<Set<string>> {
	const idColumn = (table as typeof lessons).id;
	const existing = new Set<string>();

	for (const part of chunk(ids, SELECT_CHUNK_SIZE)) {
		const found = await db
			.select({ id: idColumn })
			.from(table)
			.where(inArray(idColumn, part))
			.all();
		for (const row of found) existing.add(row.id);
	}

	return existing;
}

/** `excluded` based update set: every column except id and createdAt. */
function updateSetFor(table: SQLiteTable): Record<string, SQL> {
	const set: Record<string, SQL> = {};

	for (const [key, column] of Object.entries(getTableColumns(table))) {
		if (key === 'id' || key === 'createdAt') continue;
		set[key] = sql.raw(`excluded."${column.name}"`);
	}

	return set;
}
