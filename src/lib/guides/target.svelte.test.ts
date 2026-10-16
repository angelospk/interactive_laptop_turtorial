import { describe, it, expect, afterEach } from 'vitest';
import { findTarget, simConfigFor } from './target';
import type { GuideDefinition } from './types';

// A target can render twice, one copy per screen size (a sidebar button on a
// wide screen, a floating one on a phone). The guide must use the one on screen.

describe('findTarget', () => {
	afterEach(() => (document.body.innerHTML = ''));

	it('skips a hidden copy and returns the visible one', () => {
		document.body.innerHTML = `
			<div id="root">
				<button data-guide="compose" id="hidden" style="display:none">A</button>
				<button data-guide="compose" id="shown">B</button>
			</div>`;
		const root = document.getElementById('root')!;
		expect(findTarget(root, 'compose')?.id).toBe('shown');
	});

	it('returns null when every copy is hidden or missing', () => {
		document.body.innerHTML = `<div id="root"><b data-guide="x" style="display:none">x</b></div>`;
		const root = document.getElementById('root')!;
		expect(findTarget(root, 'x')).toBeNull();
		expect(findTarget(root, 'y')).toBeNull();
	});
});

describe('simConfigFor', () => {
	const guide = {
		simConfig: { initialApps: [] },
		resumeConfig: { initialApps: ['email'] }
	} as unknown as GuideDefinition;

	it('starts from simConfig and, after a reset, from resumeConfig', () => {
		expect(simConfigFor(guide, 0)).toEqual({ initialApps: [] });
		expect(simConfigFor(guide, 1)).toEqual({ initialApps: ['email'] });
	});

	it('falls back to simConfig when the guide has no resumeConfig', () => {
		const plain = { simConfig: { a: 1 } } as unknown as GuideDefinition;
		expect(simConfigFor(plain, 3)).toEqual({ a: 1 });
	});
});
