import { describe, it, expect } from 'vitest';
import { detectDevice, type DeviceGuess } from './deviceDetect';

/**
 * Builds a minimal navigator-like object for testing.
 * We only include the fields deviceDetect actually reads.
 */
function nav(opts: {
	userAgent?: string;
	platform?: string;
	maxTouchPoints?: number;
	userAgentData?: { platform?: string; mobile?: boolean };
}): Navigator {
	return {
		userAgent: opts.userAgent ?? '',
		platform: opts.platform ?? '',
		maxTouchPoints: opts.maxTouchPoints ?? 0,
		userAgentData: opts.userAgentData
	} as unknown as Navigator;
}

describe('detectDevice', () => {
	describe('User-Agent Client Hints (Chromium)', () => {
		it('detects Windows with high confidence', () => {
			const r = detectDevice(nav({ userAgentData: { platform: 'Windows', mobile: false } }));
			expect(r).toEqual<DeviceGuess>({ device: 'windows', confidence: 'high' });
		});

		it('detects Android with high confidence', () => {
			const r = detectDevice(nav({ userAgentData: { platform: 'Android', mobile: true } }));
			expect(r).toEqual<DeviceGuess>({ device: 'android', confidence: 'high' });
		});

		it('detects iOS/iPhone with high confidence', () => {
			const r = detectDevice(nav({ userAgentData: { platform: 'iOS', mobile: true } }));
			expect(r).toEqual<DeviceGuess>({ device: 'iphone', confidence: 'high' });
		});

		it('detects macOS (desktop, no touch) as mac with high confidence', () => {
			const r = detectDevice(
				nav({ userAgentData: { platform: 'macOS', mobile: false }, maxTouchPoints: 0 })
			);
			expect(r).toEqual<DeviceGuess>({ device: 'mac', confidence: 'high' });
		});
	});

	describe('UA string fallback (Safari/Firefox, no userAgentData)', () => {
		it('detects Windows from UA', () => {
			const r = detectDevice(
				nav({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/125.0' })
			);
			expect(r.device).toBe('windows');
			expect(r.confidence).toBe('low');
		});

		it('detects Android from UA', () => {
			const r = detectDevice(
				nav({ userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/125.0 Mobile' })
			);
			expect(r.device).toBe('android');
		});

		it('detects iPhone from UA', () => {
			const r = detectDevice(
				nav({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari' })
			);
			expect(r.device).toBe('iphone');
		});

		it('detects Mac from UA when no touch', () => {
			const r = detectDevice(
				nav({
					userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.0',
					maxTouchPoints: 0
				})
			);
			expect(r.device).toBe('mac');
		});
	});

	describe('iPad-reports-macOS trap (touch heuristic)', () => {
		it('treats macOS + touch as iOS/iphone (iPad in desktop mode)', () => {
			// Safari on iPad reports platform macOS but has maxTouchPoints > 1
			const r = detectDevice(
				nav({
					userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.0',
					platform: 'MacIntel',
					maxTouchPoints: 5
				})
			);
			expect(r.device).toBe('iphone');
		});

		it('keeps real Mac (macOS, no touch) as mac', () => {
			const r = detectDevice(
				nav({
					userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.0',
					platform: 'MacIntel',
					maxTouchPoints: 0
				})
			);
			expect(r.device).toBe('mac');
		});
	});

	describe('unknown / degraded', () => {
		it('returns unknown with low confidence when nothing matches', () => {
			const r = detectDevice(nav({ userAgent: 'SomeBot/1.0' }));
			expect(r).toEqual<DeviceGuess>({ device: 'unknown', confidence: 'low' });
		});
	});
});
