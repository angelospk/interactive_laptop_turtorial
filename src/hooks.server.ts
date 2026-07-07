import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { sequence } from '@sveltejs/kit/hooks';
import { verifySessionCookie } from '$lib/server/session';
import { getSessionSecret } from '$lib/server/sessionSecret';

// Authentication handle
const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session');
	const adminCookie = event.cookies.get('admin_session');

	if (sessionCookie) {
		// Signed HMAC cookie — verify before trusting. Forged/tampered/legacy
		// unsigned cookies fail verification and are cleared (treated as logged-out).
		const user = verifySessionCookie(sessionCookie, getSessionSecret());
		if (user) {
			event.locals.user = user;
			// Admin status can come from the (signed) user record OR admin cookie
			event.locals.admin = user.isAdmin === true || adminCookie === 'true';
		} else {
			event.cookies.delete('session', { path: '/' });
			if (adminCookie === 'true') {
				event.locals.admin = true;
			}
		}
	} else if (adminCookie === 'true') {
		// Admin-only session (no user record)
		event.locals.admin = true;
	}

	// Redirect to login if not authenticated and not already on login page or API.
	// Only for navigational GET requests — never bounce actions/data/non-GET to an HTML
	// login page. Allow /admin/login without a user session.
	if (
		event.request.method === 'GET' &&
		!event.locals.user &&
		!event.locals.admin &&
		!event.url.pathname.startsWith('/login') &&
		!event.url.pathname.startsWith('/api') &&
		!event.url.pathname.startsWith('/admin/login') &&
		// Public theory library (serves only public manifest/content, no user data)
		!event.url.pathname.startsWith('/library') &&
		!event.url.pathname.startsWith('/content') &&
		// Public "Απάτη ή Όχι;" scam-spotter practice (seed-only, no user data)
		!event.url.pathname.startsWith('/apates')
	) {
		// Remember where the user was heading so login can send them back there.
		const target = (event.url.pathname + event.url.search).slice(0, 512);
		const loginUrl = new URL('/login', event.url);
		if (target && target !== '/') {
			loginUrl.searchParams.set('redirectTo', target);
		}
		return Response.redirect(loginUrl, 302);
	}

	return resolve(event);
};

// Paraglide handle - Force Greek locale
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		// Force Greek locale regardless of browser settings
		const forcedLocale = 'el';

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', forcedLocale)
		});
	});

// Combine handles
export const handle: Handle = sequence(handleAuth, handleParaglide);

