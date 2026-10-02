import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('$env/static/private', () => ({ ADMIN_PASSWORD: 'correct-horse' }));
vi.mock('$app/environment', () => ({ dev: true }));
vi.mock('$lib/server/sessionSecret', () => ({ getSessionSecret: () => 'test-secret-0123456789' }));

// The action reads the module-level `db` (locals.db is never set in production),
// so point it at a fresh in-memory database per test.
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

import { actions } from '../+page.server';
import { createTestDb, type TestDb } from '$lib/db/__tests__/testDb';
import { registerLoginAttempt, MAX_LOGIN_ATTEMPTS } from '$lib/server/loginThrottle';
import { adminLoginAttempts } from '$lib/db/schema';

const IP = '203.0.113.7';
// dev is mocked to true, so keys are namespaced 'dev:'.
const KEY = `dev:${IP}`;

function makeEvent(db: TestDb, password: string) {
	const form = new FormData();
	form.set('password', password);
	const cookies = { set: vi.fn() };
	const event = {
		request: new Request('http://localhost/admin/login', { method: 'POST', body: form }),
		cookies,
		locals: {},
		getClientAddress: () => IP
	} as unknown as Parameters<typeof actions.default>[0];
	return { event, cookies };
}

async function run(db: TestDb, password: string) {
	const { event, cookies } = makeEvent(db, password);
	try {
		return { result: await actions.default(event), cookies };
	} catch (thrown) {
		return { result: thrown, cookies };
	}
}

const now = () => Math.floor(Date.now() / 1000);

describe('admin login action', () => {
	let db: TestDb;

	beforeEach(async () => {
		db = await createTestDb();
		currentDb = db;
	});

	it('logs in with the right password', async () => {
		const { result, cookies } = await run(db, 'correct-horse');
		expect(result).toMatchObject({ status: 302, location: '/admin' });
		expect(cookies.set).toHaveBeenCalledOnce();
	});

	it('rejects a wrong password with 401 and sets no cookie', async () => {
		const { result, cookies } = await run(db, 'wrong');
		expect(result).toMatchObject({ status: 401 });
		expect(cookies.set).not.toHaveBeenCalled();
	});

	it('refuses the attempt after MAX, even with the right password', async () => {
		for (let i = 0; i < MAX_LOGIN_ATTEMPTS; i++) {
			expect((await run(db, 'wrong')).result).toMatchObject({ status: 401 });
		}
		const { result, cookies } = await run(db, 'correct-horse');
		expect(result).toMatchObject({ status: 429 });
		expect(cookies.set).not.toHaveBeenCalled();
	});

	it('clears the count after a successful login', async () => {
		for (let i = 0; i < MAX_LOGIN_ATTEMPTS - 1; i++) await registerLoginAttempt(db, KEY, now());
		await run(db, 'correct-horse');
		expect(await db.select().from(adminLoginAttempts).all()).toHaveLength(0);
	});
});
