/**
 * Client-side device *hypothesis* for the device-aware content tracks.
 *
 * This is intentionally NOT a decision — it returns a guess that the onboarding
 * flow confirms with the user (elderly-UX: auto-detect as a hint, never silent).
 * See docs/ROADMAP.md §1 (research on UA-CH / iPad-reports-macOS).
 *
 * Priority: userAgentData (Chromium) → UA-string regex (Safari/Firefox) → touch
 * heuristic for the iPad-in-desktop-mode trap.
 */

export type Device = 'windows' | 'mac' | 'android' | 'iphone' | 'unknown';
export type DeviceGuess = { device: Device; confidence: 'high' | 'low' };

/** Subset of the User-Agent Client Hints API (Chromium only, not yet in lib.dom). */
type NavigatorUAData = { platform?: string; mobile?: boolean };
type NavWithUAData = Navigator & { userAgentData?: NavigatorUAData };

const UNKNOWN: DeviceGuess = { device: 'unknown', confidence: 'low' };

function fromUserAgentData(nav: NavWithUAData): Device | null {
	const platform = nav.userAgentData?.platform;
	if (!platform) return null;
	switch (platform) {
		case 'Windows':
			return 'windows';
		case 'macOS':
			return 'mac';
		case 'Android':
			return 'android';
		case 'iOS':
			return 'iphone';
		default:
			return null;
	}
}

function fromUaString(ua: string): Device | null {
	if (/Android/i.test(ua)) return 'android';
	if (/iPhone|iPod/i.test(ua)) return 'iphone';
	if (/Windows/i.test(ua)) return 'windows';
	if (/Macintosh|Mac OS X/i.test(ua)) return 'mac';
	return null;
}

/**
 * iPad in desktop-Safari mode reports platform macOS. A real Mac has
 * maxTouchPoints 0; an iPad exposes several. Reclassify touch-macOS as iOS.
 */
function applyIpadTrap(device: Device, nav: Navigator): Device {
	if (device === 'mac' && (nav.maxTouchPoints ?? 0) > 1) return 'iphone';
	return device;
}

export function detectDevice(navigatorLike?: Navigator): DeviceGuess {
	const nav =
		navigatorLike ?? (typeof navigator !== 'undefined' ? navigator : undefined);
	if (!nav) return UNKNOWN;

	const hinted = fromUserAgentData(nav as NavWithUAData);
	if (hinted) {
		return { device: applyIpadTrap(hinted, nav), confidence: 'high' };
	}

	const fromUa = fromUaString(nav.userAgent ?? '');
	if (fromUa) {
		return { device: applyIpadTrap(fromUa, nav), confidence: 'low' };
	}

	return UNKNOWN;
}
