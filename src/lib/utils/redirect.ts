/**
 * Open-redirect guard for the post-login `redirectTo` flow.
 *
 * Returns the value only when it is a safe *internal* path:
 *  - starts with a single "/" (not "//" — protocol-relative)
 *  - not "/\" and contains no backslash before the query string
 *    (browsers can normalise "\" to "/", which could smuggle a host)
 *
 * Anything else (absolute URLs, protocol-relative, empty, null) → null,
 * so callers fall back to a known-safe default.
 */
export function safeRedirect(value: string | null | undefined): string | null {
	if (!value) return null;
	if (value.length > 512) return null;
	if (!value.startsWith('/')) return null;
	if (value.startsWith('//')) return null;
	if (value.startsWith('/\\')) return null;

	// Reject backslashes anywhere in the path portion (before any "?" or "#").
	const pathPortion = value.split(/[?#]/)[0];
	if (pathPortion.includes('\\')) return null;

	return value;
}
