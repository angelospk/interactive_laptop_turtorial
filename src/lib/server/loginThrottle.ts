import { eq, lt, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { adminLoginAttempts } from '$lib/db/schema';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_WINDOW_SECONDS = 15 * 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = BaseSQLiteDatabase<'async', any, any>;

/**
 * Counts one login attempt for `key` and reports whether it may go ahead.
 * The count is taken atomically BEFORE the password is checked, so a burst of
 * parallel requests cannot all slip past the limit. Refused attempts still
 * count but never move the window, so hammering does not extend a lockout.
 */
export async function registerLoginAttempt(db: Db, key: string, now: number): Promise<boolean> {
	const expiredBefore = now - LOGIN_WINDOW_SECONDS;
	await db.delete(adminLoginAttempts).where(lt(adminLoginAttempts.windowStart, expiredBefore));

	const [row] = await db
		.insert(adminLoginAttempts)
		.values({ key, attempts: 1, windowStart: now })
		.onConflictDoUpdate({
			target: adminLoginAttempts.key,
			set: {
				attempts: sql`CASE WHEN ${adminLoginAttempts.windowStart} <= ${expiredBefore} THEN 1 ELSE ${adminLoginAttempts.attempts} + 1 END`,
				windowStart: sql`CASE WHEN ${adminLoginAttempts.windowStart} <= ${expiredBefore} THEN ${now} ELSE ${adminLoginAttempts.windowStart} END`
			}
		})
		.returning({ attempts: adminLoginAttempts.attempts });

	return row.attempts <= MAX_LOGIN_ATTEMPTS;
}

export async function clearLoginAttempts(db: Db, key: string): Promise<void> {
	await db.delete(adminLoginAttempts).where(eq(adminLoginAttempts.key, key));
}
