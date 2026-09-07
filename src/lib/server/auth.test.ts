import { describe, it, expect, beforeEach, vi } from 'vitest';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { createTestDb, type TestDb } from '$lib/db/__tests__/testDb';

// auth.ts reads the module-level `db` from $lib/db/client, so we point it at a
// fresh in-memory database per test (same pattern as the endpoint tests).
let currentDb: TestDb;
vi.mock('$lib/db/client', async () => {
	const schema = await import('$lib/db/schema');
	return {
		get db() {
			return currentDb;
		},
		...schema
	};
});

const {
	createUser,
	getUserByUsername,
	getUserById,
	updateLastLogin,
	loginOrCreateUser,
	toUserSession,
	updatePreferredDevice
} = await import('./auth');

beforeEach(async () => {
	currentDb = await createTestDb();
});

describe('createUser / getUserByUsername / getUserById', () => {
	it('creates a user and finds it by username and by id', async () => {
		const created = await createUser('giagia', 'Γιαγιά');
		expect(created.username).toBe('giagia');
		expect(created.displayName).toBe('Γιαγιά');

		expect((await getUserByUsername('giagia'))?.id).toBe(created.id);
		expect((await getUserById(created.id))?.username).toBe('giagia');
	});

	it('falls back to the username as displayName', async () => {
		const created = await createUser('pappous');
		expect(created.displayName).toBe('pappous');
	});

	it('returns undefined for an unknown username or id', async () => {
		expect(await getUserByUsername('nobody')).toBeUndefined();
		expect(await getUserById('no-such-id')).toBeUndefined();
	});
});

describe('loginOrCreateUser', () => {
	it('rejects a username shorter than 2 characters', async () => {
		await expect(loginOrCreateUser('a')).rejects.toThrow(/at least 2/);
		await expect(loginOrCreateUser('   ')).rejects.toThrow(/at least 2/);
	});

	it('normalises the username to trimmed lowercase', async () => {
		const session = await loginOrCreateUser('  GiaGia  ');
		expect(session.username).toBe('giagia');
	});

	it('creates the user on first login', async () => {
		const session = await loginOrCreateUser('newcomer');
		expect(await getUserByUsername('newcomer')).toBeDefined();
		expect(session.lastLogin).toBeInstanceOf(Date);
	});

	it('reuses the same row on a second login', async () => {
		const first = await loginOrCreateUser('repeat');
		const second = await loginOrCreateUser('repeat');
		expect(second.id).toBe(first.id);
	});

	// Regression (bd-hem): the session cookie is signed from this return value,
	// so a stale row here means the cookie advertises the PREVIOUS login time.
	it('returns the freshly written lastLogin for an existing user', async () => {
		const created = await createUser('stale');
		const old = new Date('2020-01-01T00:00:00Z');
		await currentDb.update(users).set({ lastLogin: old }).where(eq(users.id, created.id));

		const session = await loginOrCreateUser('stale');

		expect(session.lastLogin!.getTime()).toBeGreaterThan(old.getTime());
		const row = await getUserById(created.id);
		expect(session.lastLogin!.getTime()).toBe(row!.lastLogin!.getTime());
	});
});

describe('updateLastLogin', () => {
	it('writes a newer lastLogin to the row', async () => {
		const created = await createUser('toucher');
		const old = new Date('2020-01-01T00:00:00Z');
		await currentDb.update(users).set({ lastLogin: old }).where(eq(users.id, created.id));

		await updateLastLogin(created.id);

		const row = await getUserById(created.id);
		expect(row!.lastLogin!.getTime()).toBeGreaterThan(old.getTime());
	});
});

describe('toUserSession', () => {
	it('maps a row to the public session shape', async () => {
		const created = await createUser('mapper', 'Χάρτης');
		expect(toUserSession(created)).toMatchObject({
			id: created.id,
			username: 'mapper',
			displayName: 'Χάρτης',
			isAdmin: false,
			preferredDevice: null
		});
	});

	it('omits an empty displayName instead of leaking an empty string', async () => {
		const [row] = await currentDb
			.insert(users)
			.values({ username: 'nodisplay', displayName: null })
			.returning();
		expect(toUserSession(row).displayName).toBeUndefined();
	});
});

describe('updatePreferredDevice', () => {
	it('persists the device and returns the refreshed session', async () => {
		const created = await createUser('devicer');
		const session = await updatePreferredDevice(created.id, 'android');
		expect(session?.preferredDevice).toBe('android');
		expect((await getUserById(created.id))?.preferredDevice).toBe('android');
	});

	it('returns null when the user row is gone', async () => {
		expect(await updatePreferredDevice('ghost-id', 'windows')).toBeNull();
	});
});
