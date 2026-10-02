import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_PASSWORD } from '$env/static/private';
import { signAdminCookie, passwordMatches } from '$lib/server/session';
import { getSessionSecret } from '$lib/server/sessionSecret';
import { registerLoginAttempt, clearLoginAttempts } from '$lib/server/loginThrottle';

const ADMIN_MAX_AGE = 60 * 60 * 24; // 1 day

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.admin) {
		throw redirect(302, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, locals, getClientAddress }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (!ADMIN_PASSWORD) {
			console.error('ADMIN_PASSWORD is not set in environment variables');
			return fail(500, { error: 'Server configuration error' });
		}

		// dev and prod share one database, so keep their counters apart.
		const throttleKey = `${dev ? 'dev' : 'prod'}:${getClientAddress()}`;
		const allowed = await registerLoginAttempt(
			locals.db,
			throttleKey,
			Math.floor(Date.now() / 1000)
		);
		if (!allowed) {
			return fail(429, { error: 'Too many attempts. Try again in 15 minutes.' });
		}

		if (!passwordMatches(password, ADMIN_PASSWORD)) {
			return fail(401, { error: 'Invalid password' });
		}

		await clearLoginAttempts(locals.db, throttleKey);

		// Set signed admin session cookie (HMAC — not a forgeable literal 'true')
		cookies.set('admin_session', signAdminCookie(getSessionSecret(), ADMIN_MAX_AGE), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			maxAge: ADMIN_MAX_AGE
		});

		throw redirect(302, '/admin');
	}
};
