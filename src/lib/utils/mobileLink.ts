/**
 * Link-safety helpers for the QR / anti-scam mobile lessons (CURRICULUM_PLAN
 * §4γ). The teaching point — and the thing seniors get fooled by — is reading
 * the *real* host of a link, not a lookalike. So the checks parse the URL
 * properly instead of substring-matching (codex plan review: reject
 * `gov.gr.evil.com`, `gov.gr@evil.com`, `evil.com/?x=gov.gr`, and http://).
 */

/** The registrable host of a URL, lower-cased, or null if it can't be parsed. */
export function parseHost(url: string): string | null {
	try {
		return new URL(url.trim()).hostname.toLowerCase();
	} catch {
		return null;
	}
}

/**
 * Whether `host` belongs to `domain` — exactly the domain or a real subdomain
 * of it. `gov.gr` matches `gov.gr` and `www.gov.gr`, but NOT `gov.gr.evil.com`
 * (a different registrable domain that merely starts with the string).
 */
export function isHostWithinDomain(host: string | null, domain: string): boolean {
	if (!host) return false;
	const h = host.toLowerCase();
	const d = domain.toLowerCase();
	return h === d || h.endsWith(`.${d}`);
}

export interface LinkSafety {
	/** Parsed host, or null when the URL is malformed. */
	host: string | null;
	/** Uses https (the only scheme we treat as safe to open). */
	https: boolean;
	/** Host is the official domain (or a subdomain of it) AND https. */
	official: boolean;
}

/**
 * Evaluate a link against an expected official domain. `official` is true only
 * when the parsed host is within `expectedDomain` over https — so a plausible
 * lookalike or an http link is never reported as official.
 */
export function evaluateLink(url: string, expectedDomain: string): LinkSafety {
	let https = false;
	let host: string | null = null;
	try {
		const u = new URL(url.trim());
		https = u.protocol === 'https:';
		host = u.hostname.toLowerCase();
	} catch {
		return { host: null, https: false, official: false };
	}
	return { host, https, official: https && isHostWithinDomain(host, expectedDomain) };
}
