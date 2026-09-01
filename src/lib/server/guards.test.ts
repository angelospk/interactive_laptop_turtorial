import { describe, it, expect } from 'vitest';
import { requireUser, requireAdmin, requireAdminPage } from './guards';
import type { UserSession } from '$lib/types';

const user: UserSession = { id: 'u1', username: 'giagia', isAdmin: false };

/** Unwraps whatever SvelteKit's error()/redirect() threw into a plain shape. */
function thrownBy(fn: () => unknown): { status?: number; location?: string; message?: string } {
	try {
		fn();
	} catch (e) {
		const err = e as { status?: number; location?: string; body?: { message?: string } };
		return { status: err.status, location: err.location, message: err.body?.message };
	}
	throw new Error('expected the guard to throw');
}

describe('requireUser', () => {
	it('returns the session when one is present', () => {
		expect(requireUser({ user })).toBe(user);
	});

	it('throws 401 when no user is signed in', () => {
		expect(thrownBy(() => requireUser({}))).toMatchObject({ status: 401 });
	});

	it('throws 401 for an explicitly undefined user', () => {
		expect(thrownBy(() => requireUser({ user: undefined }))).toMatchObject({ status: 401 });
	});
});

describe('requireAdmin', () => {
	it('passes for an admin', () => {
		expect(() => requireAdmin({ admin: true })).not.toThrow();
	});

	// Normalised (bd-7gk): /api/admin/* used to answer 401 while /admin pages
	// answered 403 for the same condition. 403 is the honest one — the request
	// is authenticated as far as this app is concerned, it is just not allowed.
	it('throws 403 when the admin flag is absent', () => {
		expect(thrownBy(() => requireAdmin({}))).toMatchObject({ status: 403 });
	});

	it('throws 403 for a signed-in non-admin user', () => {
		expect(thrownBy(() => requireAdmin({ user, admin: false }))).toMatchObject({ status: 403 });
	});
});

describe('requireAdminPage', () => {
	it('passes for an admin', () => {
		expect(() => requireAdminPage({ admin: true })).not.toThrow();
	});

	// Pages redirect rather than render an error: a logged-out admin should land
	// on the login form, not on a 403 page with no way forward.
	it('redirects to /admin/login for a non-admin', () => {
		expect(thrownBy(() => requireAdminPage({}))).toMatchObject({
			status: 302,
			location: '/admin/login'
		});
	});
});
