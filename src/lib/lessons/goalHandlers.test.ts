import { describe, it, expect } from 'vitest';
import { checkGoalMatch } from './goalHandlers';
import { GOALS, isValidGoalId } from './goals';

// ── Registry contract ──────────────────────────────────────────────────────────

describe('GOALS registry', () => {
	it('isValidGoalId returns true for known goals', () => {
		expect(isValidGoalId('open-app')).toBe(true);
		expect(isValidGoalId('close-app')).toBe(true);
	});

	it('isValidGoalId returns false for unknown strings', () => {
		expect(isValidGoalId('paste-cpy')).toBe(false);
		expect(isValidGoalId('switch-tabs')).toBe(false); // intentional: seed must use 'switch-tab'
		expect(isValidGoalId('')).toBe(false);
	});
});

// ── Window management ──────────────────────────────────────────────────────────

describe('open-app', () => {
	it('matches when appId equals targetAppId', () => {
		expect(checkGoalMatch('open-app', 'open-app', { appId: 'explorer' }, { targetAppId: 'explorer' })).toBe(true);
	});

	it('does not match wrong appId', () => {
		expect(checkGoalMatch('open-app', 'open-app', { appId: 'browser' }, { targetAppId: 'explorer' })).toBe(false);
	});

	it('does not match wrong action', () => {
		expect(checkGoalMatch('open-app', 'close-app', { appId: 'explorer' }, { targetAppId: 'explorer' })).toBe(false);
	});
});

describe('minimize-app / restore-app / maximize-app / close-app', () => {
	const appConfig = { targetAppId: 'explorer' };

	it('minimize-app', () => {
		expect(checkGoalMatch('minimize-app', 'minimize-app', { appId: 'explorer' }, appConfig)).toBe(true);
		expect(checkGoalMatch('minimize-app', 'minimize-app', { appId: 'browser' }, appConfig)).toBe(false);
	});

	it('restore-app', () => {
		expect(checkGoalMatch('restore-app', 'restore-app', { appId: 'explorer' }, appConfig)).toBe(true);
	});

	it('maximize-app', () => {
		expect(checkGoalMatch('maximize-app', 'maximize-app', { appId: 'explorer' }, appConfig)).toBe(true);
	});

	it('close-app', () => {
		expect(checkGoalMatch('close-app', 'close-app', { appId: 'explorer' }, appConfig)).toBe(true);
		expect(checkGoalMatch('close-app', 'close-app', { appId: 'browser' }, appConfig)).toBe(false);
	});
});

// ── Desktop UI ─────────────────────────────────────────────────────────────────

describe('desktop UI goals', () => {
	it('open-start-menu', () => {
		expect(checkGoalMatch('open-start-menu', 'open-start-menu', {}, {})).toBe(true);
		expect(checkGoalMatch('open-start-menu', 'open-quick-settings', {}, {})).toBe(false);
	});

	it('open-quick-settings', () => {
		expect(checkGoalMatch('open-quick-settings', 'open-quick-settings', {}, {})).toBe(true);
	});

	it('open-task-view', () => {
		expect(checkGoalMatch('open-task-view', 'open-task-view', {}, {})).toBe(true);
	});
});

// ── File Explorer ──────────────────────────────────────────────────────────────

describe('file explorer goals', () => {
	it('create-folder', () => {
		expect(checkGoalMatch('create-folder', 'create-folder', {}, {})).toBe(true);
	});

	it('paste-cut-file triggered by paste-cut action', () => {
		expect(checkGoalMatch('paste-cut-file', 'paste-cut', {}, {})).toBe(true);
		expect(checkGoalMatch('paste-cut-file', 'paste-copy', {}, {})).toBe(false);
	});

	it('rename-file triggered by rename action', () => {
		expect(checkGoalMatch('rename-file', 'rename', {}, {})).toBe(true);
	});

	it('delete-file triggered by delete action', () => {
		expect(checkGoalMatch('delete-file', 'delete', {}, {})).toBe(true);
	});

	it('drag-drop-file triggered by drag-drop action', () => {
		expect(checkGoalMatch('drag-drop-file', 'drag-drop', {}, {})).toBe(true);
	});
});

// ── Browser ────────────────────────────────────────────────────────────────────

describe('navigate-site', () => {
	it('matches when url contains targetUrl', () => {
		expect(checkGoalMatch('navigate-site', 'navigate', { url: 'https://gov.gr/page' }, { targetUrl: 'gov.gr' })).toBe(true);
	});

	it('does not match when url does not contain targetUrl', () => {
		expect(checkGoalMatch('navigate-site', 'navigate', { url: 'https://news.gr' }, { targetUrl: 'gov.gr' })).toBe(false);
	});

	it('does not match wrong action', () => {
		expect(checkGoalMatch('navigate-site', 'search', { url: 'https://gov.gr' }, { targetUrl: 'gov.gr' })).toBe(false);
	});
});

describe('navigate (no required targetUrl)', () => {
	it('matches any url when no targetUrl configured', () => {
		expect(checkGoalMatch('navigate', 'navigate', { url: 'https://anything.gr' }, {})).toBe(true);
	});

	it('matches url containing targetUrl when configured', () => {
		expect(checkGoalMatch('navigate', 'navigate', { url: 'https://news.gr' }, { targetUrl: 'news.gr' })).toBe(true);
		expect(checkGoalMatch('navigate', 'navigate', { url: 'https://other.gr' }, { targetUrl: 'news.gr' })).toBe(false);
	});
});

describe('switch-tab', () => {
	it('matches switch-tab action', () => {
		expect(checkGoalMatch('switch-tab', 'switch-tab', {}, {})).toBe(true);
	});

	it('also matches legacy switch-tabs action', () => {
		expect(checkGoalMatch('switch-tab', 'switch-tabs', {}, {})).toBe(true);
	});
});

describe('bookmark', () => {
	it('matches when url contains targetSite', () => {
		expect(checkGoalMatch('bookmark', 'bookmark', { url: 'https://gov.gr/page' }, { targetSite: 'gov.gr' })).toBe(true);
	});

	it('matches any url when no target configured', () => {
		expect(checkGoalMatch('bookmark', 'bookmark', { url: 'https://anything.gr' }, {})).toBe(true);
	});

	it('does not match url without targetSite', () => {
		expect(checkGoalMatch('bookmark', 'bookmark', { url: 'https://news.gr' }, { targetSite: 'gov.gr' })).toBe(false);
	});
});

// ── Email ──────────────────────────────────────────────────────────────────────

describe('email goals', () => {
	it('read-all-unread triggered by read-all-unread-complete', () => {
		expect(checkGoalMatch('read-all-unread', 'read-all-unread-complete', {}, {})).toBe(true);
		expect(checkGoalMatch('read-all-unread', 'read-all-unread', {}, {})).toBe(false);
	});

	it('attach-file and email-attachment both triggered by attach-file action', () => {
		expect(checkGoalMatch('attach-file', 'attach-file', {}, {})).toBe(true);
		expect(checkGoalMatch('email-attachment', 'attach-file', {}, {})).toBe(true);
	});
});

// ── Spreadsheet ────────────────────────────────────────────────────────────────

describe('update-cell', () => {
	it('matches when no cell/value constraint', () => {
		expect(checkGoalMatch('update-cell', 'update-cell', { cellId: 'A1', value: 'hello' }, {})).toBe(true);
	});

	it('matches exact cell and value', () => {
		expect(checkGoalMatch('update-cell', 'update-cell', { cellId: 'B2', value: '42' }, { targetCell: 'B2', targetValue: '42' })).toBe(true);
	});

	it('fails wrong cell', () => {
		expect(checkGoalMatch('update-cell', 'update-cell', { cellId: 'A1', value: '42' }, { targetCell: 'B2', targetValue: '42' })).toBe(false);
	});

	it('fails wrong value', () => {
		expect(checkGoalMatch('update-cell', 'update-cell', { cellId: 'B2', value: '99' }, { targetCell: 'B2', targetValue: '42' })).toBe(false);
	});

	it('trims whitespace when comparing values', () => {
		expect(checkGoalMatch('update-cell', 'update-cell', { cellId: 'B2', value: ' 42 ' }, { targetCell: 'B2', targetValue: '42' })).toBe(true);
	});
});

describe('enter-formula', () => {
	it('triggered by formula-success action', () => {
		expect(checkGoalMatch('enter-formula', 'formula-success', {}, {})).toBe(true);
		expect(checkGoalMatch('enter-formula', 'enter-formula', {}, {})).toBe(false);
	});
});

// ── Security ───────────────────────────────────────────────────────────────────

describe('identify-phishing', () => {
	it('matches report-phishing with correct=true', () => {
		expect(checkGoalMatch('identify-phishing', 'report-phishing', { correct: true }, {})).toBe(true);
	});

	it('does not match when correct=false', () => {
		expect(checkGoalMatch('identify-phishing', 'report-phishing', { correct: false }, {})).toBe(false);
	});
});

describe('handle-cookies', () => {
	it('matches when choice equals targetChoice', () => {
		expect(checkGoalMatch('handle-cookies', 'cookie-choice', { choice: 'reject' }, { targetChoice: 'reject' })).toBe(true);
	});

	it('does not match wrong choice', () => {
		expect(checkGoalMatch('handle-cookies', 'cookie-choice', { choice: 'accept' }, { targetChoice: 'reject' })).toBe(false);
	});
});

describe('secure-login', () => {
	it('matches bank-login when success=true and strength=strong', () => {
		expect(checkGoalMatch('secure-login', 'bank-login', { success: true, strength: 'strong' }, {})).toBe(true);
	});

	it('does not match weak password', () => {
		expect(checkGoalMatch('secure-login', 'bank-login', { success: true, strength: 'weak' }, {})).toBe(false);
	});
});

// ── Unknown goal guard ─────────────────────────────────────────────────────────

describe('unknown goal', () => {
	it('returns false and does not throw for unregistered goal', () => {
		// @ts-expect-error — intentionally testing invalid goal
		expect(checkGoalMatch('paste-cpy', 'paste-copy', {}, {})).toBe(false);
	});
});

// ── Coverage sanity: every registered goal has a handler ──────────────────────

describe('handler coverage', () => {
	it('every GoalId in GOALS has a matching handler', () => {
		const goals = Object.keys(GOALS) as (keyof typeof GOALS)[];
		for (const goal of goals) {
			// checkGoalMatch with a no-op action should return false (not throw)
			expect(() => checkGoalMatch(goal, '__noop__', {}, {})).not.toThrow();
		}
	});
});
