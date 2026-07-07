import { env } from '$env/dynamic/private';

/**
 * Resolves the HMAC secret used to sign session cookies.
 *
 * - Production: SESSION_SECRET is mandatory. Missing it throws at startup rather
 *   than silently signing with a guessable dev key.
 * - Development: falls back to a fixed, clearly-not-secret key so `.env` is not
 *   required for local work. This key must NEVER reach production.
 */
const DEV_FALLBACK = 'dev-only-insecure-session-secret-change-me';

let cached: string | null = null;

export function getSessionSecret(): string {
	if (cached) return cached;

	const secret = env.SESSION_SECRET?.trim();
	if (secret && secret.length >= 16) {
		cached = secret;
		return cached;
	}

	if (process.env.NODE_ENV === 'production') {
		throw new Error(
			'SESSION_SECRET is required in production (min 16 chars). Refusing to sign sessions with the dev fallback.'
		);
	}

	cached = DEV_FALLBACK;
	return cached;
}
