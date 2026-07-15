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

// ── Word Processor ─────────────────────────────────────────────────────────────

describe('update-text', () => {
	it('matches when no targetText configured', () => {
		expect(checkGoalMatch('update-text', 'update-text', { text: 'anything' }, {})).toBe(true);
	});

	it('matches when text includes targetText', () => {
		expect(checkGoalMatch('update-text', 'update-text', { text: 'ΑΙΤΗΣΗ\nΚείμενο' }, { targetText: 'ΑΙΤΗΣΗ' })).toBe(true);
	});

	it('does not match when text missing targetText', () => {
		expect(checkGoalMatch('update-text', 'update-text', { text: 'Κείμενο' }, { targetText: 'ΑΙΤΗΣΗ' })).toBe(false);
	});

	it('does not match wrong action', () => {
		expect(checkGoalMatch('update-text', 'format-bold', { text: 'ΑΙΤΗΣΗ' }, {})).toBe(false);
	});
});

describe('format-text-bold', () => {
	it('matches format-bold action', () => {
		expect(checkGoalMatch('format-text-bold', 'format-bold', {}, {})).toBe(true);
	});

	it('does not match other actions', () => {
		expect(checkGoalMatch('format-text-bold', 'format-italic', {}, {})).toBe(false);
	});
});

describe('format-text-italic', () => {
	it('matches format-italic action', () => {
		expect(checkGoalMatch('format-text-italic', 'format-italic', {}, {})).toBe(true);
	});
});

describe('format-text-underline', () => {
	it('matches format-underline action', () => {
		expect(checkGoalMatch('format-text-underline', 'format-underline', {}, {})).toBe(true);
	});
});

describe('format-text-align', () => {
	it('matches when align equals targetAlign', () => {
		expect(checkGoalMatch('format-text-align', 'format-align', { align: 'center' }, { targetAlign: 'center' })).toBe(true);
	});

	it('does not match wrong align', () => {
		expect(checkGoalMatch('format-text-align', 'format-align', { align: 'left' }, { targetAlign: 'center' })).toBe(false);
	});
});

describe('format-font-size', () => {
	it('matches when size equals targetSize', () => {
		expect(checkGoalMatch('format-font-size', 'format-font-size', { size: '18' }, { targetSize: '18' })).toBe(true);
	});

	it('matches when size is number and targetSize is string', () => {
		expect(checkGoalMatch('format-font-size', 'format-font-size', { size: 18 }, { targetSize: '18' })).toBe(true);
	});

	it('does not match wrong size', () => {
		expect(checkGoalMatch('format-font-size', 'format-font-size', { size: '12' }, { targetSize: '18' })).toBe(false);
	});
});

describe('insert-bullet-list', () => {
	it('matches insert-bullet-list action', () => {
		expect(checkGoalMatch('insert-bullet-list', 'insert-bullet-list', {}, {})).toBe(true);
	});
});

describe('save-document', () => {
	it('matches save-document action', () => {
		expect(checkGoalMatch('save-document', 'save-document', {}, {})).toBe(true);
	});
});

// ── Mobile simulation (mobile-sim lessonType, CURRICULUM_PLAN B2) ──────────────

describe('mobile-open-app', () => {
	const config = { targetAppId: 'phone' };

	it('matches when the target app is opened', () => {
		expect(checkGoalMatch('mobile-open-app', 'mobile-app-opened', { appId: 'phone' }, config)).toBe(true);
	});

	it('does not match a different app', () => {
		expect(checkGoalMatch('mobile-open-app', 'mobile-app-opened', { appId: 'viber' }, config)).toBe(false);
	});

	it('does not match desktop open-app events (namespaces stay separate)', () => {
		expect(checkGoalMatch('mobile-open-app', 'open-app', { appId: 'phone' }, config)).toBe(false);
	});
});

describe('mobile-dial-number', () => {
	const config = { targetNumber: '2101234567' };

	it('matches when the exact number is called', () => {
		expect(
			checkGoalMatch('mobile-dial-number', 'mobile-call-placed', { number: '2101234567' }, config)
		).toBe(true);
	});

	it('ignores spacing/formatting differences in the dialled number', () => {
		expect(
			checkGoalMatch('mobile-dial-number', 'mobile-call-placed', { number: '210 123 4567' }, config)
		).toBe(true);
	});

	it('does not match a wrong number', () => {
		expect(
			checkGoalMatch('mobile-dial-number', 'mobile-call-placed', { number: '2109999999' }, config)
		).toBe(false);
	});

	it('matches any number when no target is configured', () => {
		expect(checkGoalMatch('mobile-dial-number', 'mobile-call-placed', { number: '69' }, {})).toBe(true);
	});

	it('does not match merely typing digits (call must be placed)', () => {
		expect(
			checkGoalMatch('mobile-dial-number', 'mobile-digit-typed', { number: '2101234567' }, config)
		).toBe(false);
	});
});

describe('mobile-call-contact', () => {
	const config = { targetContactId: 'maria' };

	it('matches when the target contact is called (single canonical call event)', () => {
		expect(
			checkGoalMatch(
				'mobile-call-contact',
				'mobile-call-placed',
				{ number: '697', contactId: 'maria' },
				config
			)
		).toBe(true);
	});

	it('does not match another contact or a keypad-only call', () => {
		expect(
			checkGoalMatch(
				'mobile-call-contact',
				'mobile-call-placed',
				{ number: '697', contactId: 'nikos' },
				config
			)
		).toBe(false);
		// Keypad call carries no contactId → not a contacts-tab call.
		expect(
			checkGoalMatch('mobile-call-contact', 'mobile-call-placed', { number: '123' }, config)
		).toBe(false);
	});
});

describe('mobile-send-sms / mobile-send-chat (channel separation)', () => {
	it('sms goal matches only the sms channel', () => {
		expect(
			checkGoalMatch('mobile-send-sms', 'mobile-message-sent', { channel: 'sms', text: 'γεια' }, {})
		).toBe(true);
		expect(
			checkGoalMatch('mobile-send-sms', 'mobile-message-sent', { channel: 'viber', text: 'γεια' }, {})
		).toBe(false);
	});

	it('chat goal matches only the viber channel', () => {
		expect(
			checkGoalMatch('mobile-send-chat', 'mobile-message-sent', { channel: 'viber', text: 'γεια' }, {})
		).toBe(true);
		expect(
			checkGoalMatch('mobile-send-chat', 'mobile-message-sent', { channel: 'sms', text: 'γεια' }, {})
		).toBe(false);
	});

	it('respects targetConversationId when configured', () => {
		const config = { targetConversationId: 'kori' };
		expect(
			checkGoalMatch(
				'mobile-send-sms',
				'mobile-message-sent',
				{ channel: 'sms', conversationId: 'kori', text: 'γεια' },
				config
			)
		).toBe(true);
		expect(
			checkGoalMatch(
				'mobile-send-sms',
				'mobile-message-sent',
				{ channel: 'sms', conversationId: 'gios', text: 'γεια' },
				config
			)
		).toBe(false);
	});
});

describe('mobile-start-videocall', () => {
	it('matches a video call started in the target conversation', () => {
		const config = { targetConversationId: 'eleni' };
		expect(
			checkGoalMatch(
				'mobile-start-videocall',
				'mobile-videocall-started',
				{ conversationId: 'eleni' },
				config
			)
		).toBe(true);
		expect(
			checkGoalMatch(
				'mobile-start-videocall',
				'mobile-videocall-started',
				{ conversationId: 'giorgos' },
				config
			)
		).toBe(false);
	});

	it('is not satisfied by merely sending a message', () => {
		expect(
			checkGoalMatch(
				'mobile-start-videocall',
				'mobile-message-sent',
				{ channel: 'viber', conversationId: 'eleni' },
				{}
			)
		).toBe(false);
	});
});

describe('mobile-change-font-size', () => {
	it('matches any size change when no target is set', () => {
		expect(
			checkGoalMatch('mobile-change-font-size', 'mobile-font-size-set', { size: 'large' }, {})
		).toBe(true);
	});

	it('matches only the configured target size', () => {
		const config = { targetSize: 'large' };
		expect(
			checkGoalMatch('mobile-change-font-size', 'mobile-font-size-set', { size: 'large' }, config)
		).toBe(true);
		expect(
			checkGoalMatch('mobile-change-font-size', 'mobile-font-size-set', { size: 'small' }, config)
		).toBe(false);
	});
});

describe('mobile-connect-wifi', () => {
	it('matches connecting to the target network', () => {
		const config = { targetSsid: 'SPITI-WIFI' };
		expect(
			checkGoalMatch('mobile-connect-wifi', 'mobile-wifi-connected', { ssid: 'SPITI-WIFI' }, config)
		).toBe(true);
		expect(
			checkGoalMatch('mobile-connect-wifi', 'mobile-wifi-connected', { ssid: 'CAFE' }, config)
		).toBe(false);
	});

	it('does not match desktop connect-wifi events', () => {
		expect(checkGoalMatch('mobile-connect-wifi', 'connect-wifi', {}, {})).toBe(false);
	});
});

describe('mobile-screenshot', () => {
	it('matches the screenshot-taken event (chord already validated by the component)', () => {
		expect(checkGoalMatch('mobile-screenshot', 'mobile-screenshot-taken', {}, {})).toBe(true);
	});

	it('does not match other mobile events', () => {
		expect(checkGoalMatch('mobile-screenshot', 'mobile-app-opened', { appId: 'x' }, {})).toBe(false);
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
