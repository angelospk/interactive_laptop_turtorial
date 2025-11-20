import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import type { UserSession } from '$lib/types';
import { sequence } from '@sveltejs/kit/hooks';

// Authentication handle
const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		try {
			const user: UserSession = JSON.parse(sessionCookie);
			event.locals.user = user;
		} catch (error) {
			console.error('Error parsing session cookie:', error);
			event.cookies.delete('session', { path: '/' });
		}
	}

	// Redirect to login if not authenticated and not already on login page or API
	if (!event.locals.user && !event.url.pathname.startsWith('/login') && !event.url.pathname.startsWith('/api')) {
		return Response.redirect(new URL('/login', event.url), 302);
	}

	return resolve(event);
};

// Paraglide handle
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// Combine handles
export const handle: Handle = sequence(handleAuth, handleParaglide);

