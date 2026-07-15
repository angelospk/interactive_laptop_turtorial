import type { GoalId } from './goals';

type GoalHandler = (action: string, data: Record<string, unknown>, config: Record<string, unknown>) => boolean;

/**
 * One handler per GoalId.
 *
 * Each handler receives:
 *   action — the event fired by the simulation
 *   data   — event payload (appId, url, value, etc.)
 *   config — lesson config from the database
 *
 * Returns true when the goal is satisfied.
 */
const goalHandlers: Record<GoalId, GoalHandler> = {
	// ── Window management ──────────────────────────────────────────────────
	'open-app': (action, data, config) =>
		action === 'open-app' && data.appId === config.targetAppId,

	'minimize-app': (action, data, config) =>
		action === 'minimize-app' && data.appId === config.targetAppId,

	'restore-app': (action, data, config) =>
		action === 'restore-app' && data.appId === config.targetAppId,

	'maximize-app': (action, data, config) =>
		action === 'maximize-app' && data.appId === config.targetAppId,

	'close-app': (action, data, config) =>
		action === 'close-app' && data.appId === config.targetAppId,

	// ── Desktop UI ─────────────────────────────────────────────────────────
	'open-start-menu': (action) => action === 'open-start-menu',
	'open-quick-settings': (action) => action === 'open-quick-settings',
	'open-task-view': (action) => action === 'open-task-view',

	// ── File Explorer ──────────────────────────────────────────────────────
	'create-folder': (action) => action === 'create-folder',
	'select-file': (action) => action === 'select-file',
	'paste-copy': (action) => action === 'paste-copy',
	'paste-cut-file': (action) => action === 'paste-cut',
	'rename-file': (action) => action === 'rename',
	'delete-file': (action) => action === 'delete',
	'drag-drop-file': (action) => action === 'drag-drop',

	// ── Browser ────────────────────────────────────────────────────────────
	'new-tab': (action) => action === 'new-tab',

	navigate: (action, data, config) =>
		action === 'navigate' &&
		typeof data.url === 'string' &&
		(!config.targetUrl || data.url.includes(config.targetUrl as string)),

	'navigate-site': (action, data, config) =>
		action === 'navigate' &&
		typeof data.url === 'string' &&
		typeof config.targetUrl === 'string' &&
		data.url.includes(config.targetUrl),

	search: (action) => action === 'search',
	'switch-tab': (action) => action === 'switch-tab' || action === 'switch-tabs',
	'close-tab': (action) => action === 'close-tab',

	bookmark: (action, data, config) => {
		if (action !== 'bookmark') return false;
		const target = (config.targetSite ?? config.targetUrl) as string | undefined;
		return !target || (typeof data.url === 'string' && data.url.includes(target));
	},

	'download-file': (action) => action === 'download-file',
	'zoom-page': (action) => action === 'zoom-page',
	'find-on-page': (action) => action === 'find-on-page',
	'open-privacy-settings': (action) => action === 'open-privacy-settings',
	'type-ai-question': (action) => action === 'type-ai-question',

	// ── Email ──────────────────────────────────────────────────────────────
	'read-all-unread': (action) => action === 'read-all-unread-complete',
	'reply-email': (action) => action === 'reply-email',
	'forward-email': (action) => action === 'forward-email',
	'delete-email': (action) => action === 'delete-email',
	'attach-file': (action) => action === 'attach-file',
	'email-attachment': (action) => action === 'attach-file',
	'download-attachment': (action) => action === 'download-attachment',

	// ── Spreadsheet ────────────────────────────────────────────────────────
	'update-cell': (action, data, config) => {
		if (action !== 'update-cell') return false;
		const cellOk = !config.targetCell || data.cellId === config.targetCell;
		const valueOk =
			!config.targetValue ||
			(typeof data.value === 'string' &&
				typeof config.targetValue === 'string' &&
				data.value.trim() === config.targetValue.trim());
		return cellOk && valueOk;
	},
	'format-cell': (action) => action === 'format-cell',
	'enter-formula': (action) => action === 'formula-success',

	// ── Settings ───────────────────────────────────────────────────────────
	'connect-wifi': (action) => action === 'connect-wifi',
	'add-printer': (action) => action === 'add-printer',
	'install-app': (action) => action === 'install-complete',
	'uninstall-app': (action) => action === 'uninstall-app',
	'update-app': (action) => action === 'update-app',
	'connect-bluetooth': (action) => action === 'connect-bluetooth',
	'open-display-settings': (action) => action === 'open-display-settings',
	'open-accessibility': (action) => action === 'open-accessibility',
	'open-sound-settings': (action) => action === 'open-sound-settings',

	// ── Security / Online services ─────────────────────────────────────────
	'identify-phishing': (action, data) => action === 'report-phishing' && !!data.correct,

	'handle-cookies': (action, data, config) =>
		action === 'cookie-choice' && data.choice === config.targetChoice,

	'secure-login': (action, data) =>
		action === 'bank-login' && !!data.success && data.strength === 'strong',

	'make-transfer': (action) => action === 'bank-transfer',
	'gov-service': (action) => action === 'gov-submit',

	// ── Video call ─────────────────────────────────────────────────────────
	'start-videocall': (action) => action === 'start-videocall',
	'mute-call': (action) => action === 'mute-call',
	'end-call': (action) => action === 'end-call',

	// ── Mobile simulation ──────────────────────────────────────────────────
	'mobile-open-app': (action, data, config) =>
		action === 'mobile-app-opened' && data.appId === config.targetAppId,

	'mobile-dial-number': (action, data, config) => {
		if (action !== 'mobile-call-placed') return false;
		if (!config.targetNumber) return true;
		// Compare digits only, so «210 123 4567» matches «2101234567».
		const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '');
		return digits(data.number) === digits(config.targetNumber);
	},

	'mobile-call-contact': (action, data, config) =>
		action === 'mobile-call-placed' &&
		data.contactId != null &&
		(!config.targetContactId || data.contactId === config.targetContactId),

	'mobile-send-sms': (action, data, config) =>
		action === 'mobile-message-sent' &&
		data.channel === 'sms' &&
		(!config.targetConversationId || data.conversationId === config.targetConversationId),

	'mobile-send-chat': (action, data, config) =>
		action === 'mobile-message-sent' &&
		data.channel === 'viber' &&
		(!config.targetConversationId || data.conversationId === config.targetConversationId),

	'mobile-change-font-size': (action, data, config) =>
		action === 'mobile-font-size-set' && (!config.targetSize || data.size === config.targetSize),

	'mobile-connect-wifi': (action, data, config) =>
		action === 'mobile-wifi-connected' && (!config.targetSsid || data.ssid === config.targetSsid),

	'mobile-start-videocall': (action, data, config) =>
		action === 'mobile-videocall-started' &&
		(!config.targetConversationId || data.conversationId === config.targetConversationId),

	// System control: the screenshot chord already matched the platform (the
	// component only emits this event for the correct button combination).
	'mobile-screenshot': (action) => action === 'mobile-screenshot-taken',

	// Close a frozen app from the recents layer — appId is carried here by design.
	'mobile-force-close': (action, data, config) =>
		action === 'mobile-app-force-closed' &&
		(!config.targetAppId || data.appId === config.targetAppId),

	// ── Word Processor ─────────────────────────────────────────────────────
	'update-text': (action, data, config) => {
		if (action !== 'update-text') return false;
		if (!config.targetText) return true;
		return typeof data.text === 'string' && data.text.includes(config.targetText as string);
	},
	'format-text-bold': (action) => action === 'format-bold',
	'format-text-italic': (action) => action === 'format-italic',
	'format-text-underline': (action) => action === 'format-underline',
	'format-text-align': (action, data, config) =>
		action === 'format-align' && data.align === config.targetAlign,
	'format-font-size': (action, data, config) =>
		action === 'format-font-size' && String(data.size) === String(config.targetSize),
	'insert-bullet-list': (action) => action === 'insert-bullet-list',
	'save-document': (action) => action === 'save-document'
};

/**
 * Public API: returns true when the given action satisfies the given goal.
 *
 * If the goal is not registered, logs a warning and returns false.
 */
export function checkGoalMatch(
	goal: GoalId,
	action: string,
	data: Record<string, unknown>,
	config: Record<string, unknown>
): boolean {
	const handler = goalHandlers[goal];
	if (!handler) {
		console.warn(`[goalHandlers] Unknown goal: "${goal}"`);
		return false;
	}
	return handler(action, data, config);
}
