import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type TestDb } from '$lib/db/__tests__/testDb';
import { adminLoginAttempts } from '$lib/db/schema';
import {
	registerLoginAttempt,
	clearLoginAttempts,
	MAX_LOGIN_ATTEMPTS,
	LOGIN_WINDOW_SECONDS
} from './loginThrottle';

const KEY = 'prod:203.0.113.7';
const T0 = 1_800_000_000;

describe('loginThrottle', () => {
	let db: TestDb;

	beforeEach(async () => {
		db = await createTestDb();
	});

	async function attempts(times: number, now = T0, key = KEY) {
		const results: boolean[] = [];
		for (let i = 0; i < times; i++) results.push(await registerLoginAttempt(db, key, now));
		return results;
	}

	it('allows exactly MAX attempts, then refuses', async () => {
		const results = await attempts(MAX_LOGIN_ATTEMPTS + 1);
		expect(results.slice(0, MAX_LOGIN_ATTEMPTS).every(Boolean)).toBe(true);
		expect(results[MAX_LOGIN_ATTEMPTS]).toBe(false);
	});

	it('still refuses one second before the window ends', async () => {
		await attempts(MAX_LOGIN_ATTEMPTS);
		expect(await registerLoginAttempt(db, KEY, T0 + LOGIN_WINDOW_SECONDS - 1)).toBe(false);
	});

	it('starts a fresh window once the window has passed', async () => {
		await attempts(MAX_LOGIN_ATTEMPTS + 3);
		const later = T0 + LOGIN_WINDOW_SECONDS;
		expect(await registerLoginAttempt(db, KEY, later)).toBe(true);
		const [row] = await db.select().from(adminLoginAttempts).all();
		expect(row).toMatchObject({ attempts: 1, windowStart: later });
	});

	it('refused attempts do not extend the window', async () => {
		await attempts(MAX_LOGIN_ATTEMPTS + 2, T0);
		await registerLoginAttempt(db, KEY, T0 + 100);
		const [row] = await db.select().from(adminLoginAttempts).all();
		expect(row.windowStart).toBe(T0);
	});

	it('counts concurrent attempts without losing any', async () => {
		const results = await Promise.all(
			Array.from({ length: MAX_LOGIN_ATTEMPTS + 5 }, () => registerLoginAttempt(db, KEY, T0))
		);
		expect(results.filter(Boolean)).toHaveLength(MAX_LOGIN_ATTEMPTS);
	});

	it('clearing resets the count', async () => {
		await attempts(MAX_LOGIN_ATTEMPTS);
		await clearLoginAttempts(db, KEY);
		expect(await registerLoginAttempt(db, KEY, T0)).toBe(true);
	});

	it('keeps keys independent', async () => {
		await attempts(MAX_LOGIN_ATTEMPTS + 1, T0, 'dev:203.0.113.7');
		expect(await registerLoginAttempt(db, KEY, T0)).toBe(true);
	});

	it('drops rows whose window has expired', async () => {
		await attempts(1, T0, 'prod:198.51.100.1');
		await registerLoginAttempt(db, KEY, T0 + LOGIN_WINDOW_SECONDS + 1);
		const rows = await db.select().from(adminLoginAttempts).all();
		expect(rows.map((r) => r.key)).toEqual([KEY]);
	});
});
