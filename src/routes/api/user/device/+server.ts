import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { updatePreferredDevice } from '$lib/server/auth';
import { signSessionCookie } from '$lib/server/session';
import { getSessionSecret } from '$lib/server/sessionSecret';
import { DEVICE_VALUES, type PreferredDevice } from '$lib/db/schema';
import type { RequestHandler } from './$types';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function isDevice(value: unknown): value is PreferredDevice {
	return typeof value === 'string' && (DEVICE_VALUES as readonly string[]).includes(value);
}

/**
 * Saves the user's preferred learning device (onboarding + later changes).
 * Re-signs the session cookie so locals.user.preferredDevice stays fresh
 * without an extra DB read on every request.
 */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	if (!locals.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const device = (body as { device?: unknown })?.device;
	if (!isDevice(device)) {
		return json(
			{ error: `device must be one of: ${DEVICE_VALUES.join(', ')}` },
			{ status: 400 }
		);
	}

	const session = await updatePreferredDevice(locals.user.id, device);
	if (!session) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	cookies.set('session', signSessionCookie(session, getSessionSecret(), SESSION_MAX_AGE), {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'strict',
		maxAge: SESSION_MAX_AGE
	});

	return json({ success: true, preferredDevice: session.preferredDevice });
};
