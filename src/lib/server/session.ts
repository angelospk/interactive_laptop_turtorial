import { createHmac, timingSafeEqual } from 'node:crypto';
import type { UserSession } from '$lib/types';

/**
 * Signed session cookies (HMAC-SHA256).
 *
 * The session cookie previously stored raw `JSON.stringify(user)`, which any
 * client could forge (e.g. flip `isAdmin` to true). We now sign the payload:
 *
 *   payload = base64url(utf8(JSON.stringify({ ...session, iat, exp })))
 *   mac     = base64url(HMAC_SHA256(secret, payload))
 *   cookie  = `${payload}.${mac}`
 *
 * Verification recomputes the MAC over the *exact* payload bytes and compares
 * in constant time BEFORE decoding/parsing the JSON. Signed ≠ encrypted — never
 * put secrets in the payload.
 */

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const B64URL = /^[A-Za-z0-9_-]+$/;

type SignedPayload = UserSession & { iat: number; exp: number };

function hmac(payloadB64: string, secret: string): string {
	return createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

export function signSessionCookie(
	session: UserSession,
	secret: string,
	maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS
): string {
	const now = Math.floor(Date.now() / 1000);
	const payload: SignedPayload = {
		...session,
		iat: now,
		exp: now + maxAgeSeconds
	};
	const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
	return `${payloadB64}.${hmac(payloadB64, secret)}`;
}

export function verifySessionCookie(cookie: string, secret: string): UserSession | null {
	if (!cookie || typeof cookie !== 'string') return null;

	const parts = cookie.split('.');
	if (parts.length !== 2) return null;

	const [payloadB64, sig] = parts;
	if (!B64URL.test(payloadB64) || !B64URL.test(sig)) return null;

	// Constant-time MAC check BEFORE touching the payload.
	const expected = hmac(payloadB64, secret);
	const sigBuf = Buffer.from(sig, 'base64url');
	const expBuf = Buffer.from(expected, 'base64url');
	if (sigBuf.length !== expBuf.length || sigBuf.length === 0) return null;
	if (!timingSafeEqual(sigBuf, expBuf)) return null;

	let payload: SignedPayload;
	try {
		payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
	} catch {
		return null;
	}

	// Expiry check.
	if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
		return null;
	}

	// Strip signing metadata; return only the user session.
	const { iat: _iat, exp: _exp, ...session } = payload;
	void _iat;
	void _exp;
	return session;
}
