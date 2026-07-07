import { describe, it, expect } from 'vitest';
import {
	signSessionCookie,
	verifySessionCookie,
	signAdminCookie,
	verifyAdminCookie
} from './session';
import type { UserSession } from '$lib/types';

const SECRET = 'test-secret-0123456789';
const OTHER_SECRET = 'different-secret-9876543210';

const user: UserSession = {
	id: 'user-123',
	username: 'giagia',
	displayName: 'Γιαγιά',
	isAdmin: false
};

describe('signSessionCookie / verifySessionCookie', () => {
	it('round-trips a user session', () => {
		const cookie = signSessionCookie(user, SECRET);
		const parsed = verifySessionCookie(cookie, SECRET);
		expect(parsed).toMatchObject({
			id: 'user-123',
			username: 'giagia',
			displayName: 'Γιαγιά',
			isAdmin: false
		});
	});

	it('produces a two-part payload.signature cookie', () => {
		const cookie = signSessionCookie(user, SECRET);
		expect(cookie.split('.')).toHaveLength(2);
	});

	it('rejects a cookie signed with a different secret', () => {
		const cookie = signSessionCookie(user, OTHER_SECRET);
		expect(verifySessionCookie(cookie, SECRET)).toBeNull();
	});

	it('rejects a tampered payload (forged isAdmin)', () => {
		const cookie = signSessionCookie(user, SECRET);
		const [, sig] = cookie.split('.');
		const forged = Buffer.from(
			JSON.stringify({ ...user, isAdmin: true }),
			'utf8'
		).toString('base64url');
		const tampered = `${forged}.${sig}`;
		expect(verifySessionCookie(tampered, SECRET)).toBeNull();
	});

	it('rejects a truncated / malformed cookie', () => {
		expect(verifySessionCookie('', SECRET)).toBeNull();
		expect(verifySessionCookie('onlyonepart', SECRET)).toBeNull();
		expect(verifySessionCookie('a.b.c', SECRET)).toBeNull();
	});

	it('rejects a legacy unsigned JSON cookie', () => {
		const legacy = JSON.stringify(user);
		expect(verifySessionCookie(legacy, SECRET)).toBeNull();
	});

	it('rejects when signature length differs (no timingSafeEqual throw)', () => {
		const cookie = signSessionCookie(user, SECRET);
		const [payload] = cookie.split('.');
		expect(verifySessionCookie(`${payload}.deadbeef`, SECRET)).toBeNull();
	});

	it('rejects an expired cookie', () => {
		// negative maxAge => already expired
		const cookie = signSessionCookie(user, SECRET, -10);
		expect(verifySessionCookie(cookie, SECRET)).toBeNull();
	});

	it('accepts a fresh cookie within its lifetime', () => {
		const cookie = signSessionCookie(user, SECRET, 60);
		expect(verifySessionCookie(cookie, SECRET)).toMatchObject({ id: 'user-123' });
	});

	it('does not leak iat/exp into the returned session', () => {
		const cookie = signSessionCookie(user, SECRET);
		const parsed = verifySessionCookie(cookie, SECRET) as Record<string, unknown>;
		expect(parsed).not.toHaveProperty('iat');
		expect(parsed).not.toHaveProperty('exp');
	});
});

describe('signAdminCookie / verifyAdminCookie', () => {
	it('round-trips a signed admin flag', () => {
		expect(verifyAdminCookie(signAdminCookie(SECRET, 3600), SECRET)).toBe(true);
	});

	it('rejects the legacy forgeable literal "true"', () => {
		expect(verifyAdminCookie('true', SECRET)).toBe(false);
	});

	it('rejects a cookie signed with a different secret', () => {
		expect(verifyAdminCookie(signAdminCookie(OTHER_SECRET, 3600), SECRET)).toBe(false);
	});

	it('rejects an expired admin cookie', () => {
		expect(verifyAdminCookie(signAdminCookie(SECRET, -10), SECRET)).toBe(false);
	});

	it('rejects malformed / empty values', () => {
		expect(verifyAdminCookie('', SECRET)).toBe(false);
		expect(verifyAdminCookie('a.b.c', SECRET)).toBe(false);
	});
});
