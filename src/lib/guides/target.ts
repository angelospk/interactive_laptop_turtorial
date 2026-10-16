import type { GuideDefinition } from './types';

/**
 * The step's `[data-guide]` element that is on screen. An app may render a
 * target twice, one copy per screen size; the hidden copy has no box.
 */
export function findTarget(root: ParentNode, target: string): HTMLElement | null {
	for (const el of root.querySelectorAll<HTMLElement>(`[data-guide="${target}"]`)) {
		const r = el.getBoundingClientRect();
		if (r.width > 0 || r.height > 0) return el;
	}
	return null;
}

/**
 * The demo starts from `simConfig`. When the guide had to put it back (the
 * learner closed the app the steps point at), it starts from `resumeConfig`,
 * so the app is open again.
 */
export const simConfigFor = (guide: GuideDefinition, epoch: number) =>
	(epoch > 0 && guide.resumeConfig) || guide.simConfig;

/** Resolves true once `target` is on screen, or false after `ms`. */
export async function waitForTarget(root: ParentNode, target: string, ms: number) {
	const until = Date.now() + ms;
	while (!findTarget(root, target)) {
		if (Date.now() >= until) return false;
		await new Promise((r) => setTimeout(r, 100));
	}
	return true;
}
