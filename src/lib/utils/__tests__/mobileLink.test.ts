import { describe, it, expect } from 'vitest';
import { parseHost, isHostWithinDomain, evaluateLink } from '../mobileLink';

describe('parseHost', () => {
	it('extracts the host', () => {
		expect(parseHost('https://www.gov.gr/ipiresies')).toBe('www.gov.gr');
	});
	it('ignores userinfo (the classic phishing trick)', () => {
		expect(parseHost('https://gov.gr@evil.com/login')).toBe('evil.com');
	});
	it('returns null for malformed input', () => {
		expect(parseHost('not a url')).toBeNull();
	});
});

describe('isHostWithinDomain', () => {
	it('matches the domain and its subdomains', () => {
		expect(isHostWithinDomain('gov.gr', 'gov.gr')).toBe(true);
		expect(isHostWithinDomain('www.gov.gr', 'gov.gr')).toBe(true);
		expect(isHostWithinDomain('kep.gov.gr', 'gov.gr')).toBe(true);
	});
	it('rejects a lookalike registrable domain', () => {
		expect(isHostWithinDomain('gov.gr.evil.com', 'gov.gr')).toBe(false);
		expect(isHostWithinDomain('govgr.gr', 'gov.gr')).toBe(false);
		expect(isHostWithinDomain('notgov.gr', 'gov.gr')).toBe(false);
	});
	it('rejects null host', () => {
		expect(isHostWithinDomain(null, 'gov.gr')).toBe(false);
	});
});

describe('evaluateLink (official gov.gr over https only)', () => {
	it('accepts the genuine official link', () => {
		const r = evaluateLink('https://www.gov.gr/ipiresies/polites', 'gov.gr');
		expect(r).toEqual({ host: 'www.gov.gr', https: true, official: true });
	});

	it.each([
		['https://gov.gr.evil.com/login', 'subdomain-suffix lookalike'],
		['https://gov.gr@evil.com/login', 'userinfo trick'],
		['https://evil.com/?redirect=gov.gr', 'query-string mention'],
		['http://www.gov.gr/ipiresies', 'insecure http'],
		['https://xn--gov-gr.gr/', 'punycode lookalike'],
		['garbage://', 'malformed']
	])('rejects %s (%s)', (url) => {
		expect(evaluateLink(url, 'gov.gr').official).toBe(false);
	});
});
