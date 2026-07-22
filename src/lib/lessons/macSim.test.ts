import { describe, it, expect } from 'vitest';
import { parseMacSimConfig, type MacSimConfig } from './macSim';

/**
 * Every seeded mac-simulation lesson must be structurally playable. These tests
 * pin the parser's guarantees so a malformed config fails loudly (dev + seed
 * contract) rather than producing an unreachable goal.
 */

const APPS = [
	{ id: 'finder', label: 'Finder', icon: '🗂️', kind: 'finder' as const, alwaysRunning: true },
	{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', kind: 'settings' as const },
	{ id: 'notes', label: 'Σημειώσεις', icon: '📝', kind: 'notes' as const },
	{ id: 'safari', label: 'Safari', icon: '🧭', kind: 'browser' as const }
];

function base(overrides: Partial<MacSimConfig>): unknown {
	return {
		goal: 'mac-open-from-dock',
		prompt: 'δοκιμή',
		apps: APPS,
		dockAppIds: ['finder', 'settings', 'notes'],
		targetAppId: 'finder',
		...overrides
	};
}

describe('parseMacSimConfig — structure', () => {
	it('accepts a valid dock-open config', () => {
		expect(() => parseMacSimConfig(base({}))).not.toThrow();
	});

	it('rejects a non-object', () => {
		expect(() => parseMacSimConfig(null)).toThrow(/must be an object/);
	});

	it('rejects a non mac-* goal', () => {
		expect(() => parseMacSimConfig(base({ goal: 'mobile-open-app' as never }))).toThrow(
			/mac-\* goal/
		);
	});

	it('rejects an empty apps list', () => {
		expect(() => parseMacSimConfig(base({ apps: [] }))).toThrow(/non-empty apps/);
	});

	it('rejects duplicate app ids', () => {
		expect(() =>
			parseMacSimConfig(base({ apps: [...APPS, { id: 'finder', label: 'x', icon: '🗂️' }] }))
		).toThrow(/duplicate mac-simulation app id/);
	});

	it('rejects an empty dock', () => {
		expect(() => parseMacSimConfig(base({ dockAppIds: [] }))).toThrow(/non-empty dockAppIds/);
	});

	it('rejects a dock referencing an unknown app', () => {
		expect(() => parseMacSimConfig(base({ dockAppIds: ['ghost'] }))).toThrow(/unknown app "ghost"/);
	});

	it('rejects two apps with the same functional kind', () => {
		expect(() =>
			parseMacSimConfig(
				base({ apps: [...APPS, { id: 'finder2', label: 'F2', icon: '🗂️', kind: 'finder' }] })
			)
		).toThrow(/multiple apps with kind "finder"/);
	});
});

describe('parseMacSimConfig — goal reachability', () => {
	it('requires the dock-open target to be in the Dock', () => {
		expect(() => parseMacSimConfig(base({ targetAppId: 'safari' }))).toThrow(/to be in the Dock/);
	});

	it('allows Spotlight to target an app NOT in the Dock', () => {
		expect(() =>
			parseMacSimConfig(base({ goal: 'mac-spotlight-search', targetAppId: 'safari' }))
		).not.toThrow();
	});

	it('requires the finder-open-folder target to be a finder app', () => {
		expect(() =>
			parseMacSimConfig(
				base({
					goal: 'mac-finder-open-folder',
					targetAppId: 'settings',
					folders: [{ id: 'docs', name: 'Έγγραφα' }]
				})
			)
		).toThrow(/kind "finder"/);
	});

	it('requires folders for finder-open-folder', () => {
		expect(() =>
			parseMacSimConfig(base({ goal: 'mac-finder-open-folder', targetAppId: 'finder' }))
		).toThrow(/needs a folders list/);
	});

	it('rejects a targetFolderId absent from folders', () => {
		expect(() =>
			parseMacSimConfig(
				base({
					goal: 'mac-finder-open-folder',
					targetAppId: 'finder',
					folders: [{ id: 'docs', name: 'Έγγραφα' }],
					targetFolderId: 'ghost'
				})
			)
		).toThrow(/is not in folders/);
	});

	it('refuses to quit an always-running app (Finder)', () => {
		expect(() => parseMacSimConfig(base({ goal: 'mac-quit-app', targetAppId: 'finder' }))).toThrow(
			/cannot target an always-running app/
		);
	});

	it('accepts quitting a normal app', () => {
		expect(() =>
			parseMacSimConfig(base({ goal: 'mac-quit-app', targetAppId: 'notes' }))
		).not.toThrow();
	});

	it('requires the increase-size target to be a settings app with a valid size', () => {
		expect(() =>
			parseMacSimConfig(
				base({ goal: 'mac-increase-size', targetAppId: 'settings', targetSize: 'huge' })
			)
		).toThrow(/targetSize must be/);
		expect(() =>
			parseMacSimConfig(
				base({ goal: 'mac-increase-size', targetAppId: 'settings', targetSize: 'large' })
			)
		).not.toThrow();
	});
});
