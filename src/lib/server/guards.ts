import { error, redirect } from '@sveltejs/kit';
import type { UserSession } from '$lib/types';

/**
 * Shared auth guards (bd-7gk).
 *
 * The same three-line check used to be copy-pasted into a dozen handlers, each
 * answering slightly differently: /admin pages threw 403 while /api/admin threw
 * 401, and /api/lessons/* threw error() while /api/progress/* returned a JSON
 * body. These three helpers are the single place that decides.
 *
 * The rule:
 *   401 — nobody is signed in.
 *   403 — signed in (as far as this app can tell) but not allowed.
 *   302 — page loads, which redirect to the login form instead of dead-ending.
 */

/** The subset of `App.Locals` the guards read. */
type AuthLocals = { user?: UserSession; admin?: boolean };

/** Throws 401 unless a user session is present. Returns the narrowed session. */
export function requireUser(locals: AuthLocals): UserSession {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	return locals.user;
}

/** Throws 403 unless the admin cookie is present. For API endpoints. */
export function requireAdmin(locals: AuthLocals): void {
	if (!locals.admin) {
		throw error(403, 'Forbidden: admin access required');
	}
}

/** Redirects to the admin login unless the admin cookie is present. For page loads. */
export function requireAdminPage(locals: AuthLocals): void {
	if (!locals.admin) {
		throw redirect(302, '/admin/login');
	}
}
