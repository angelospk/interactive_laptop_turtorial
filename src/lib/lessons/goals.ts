/**
 * Goal Registry — single source of truth for all lesson goals.
 *
 * When adding a new goal:
 *   1. Add entry here
 *   2. Add handler in goalHandlers.ts
 *   3. Add test in goalHandlers.test.ts
 */

export const GOALS = {
	// Desktop window management
	'open-app': { requiresAppId: true },
	'minimize-app': { requiresAppId: true },
	'restore-app': { requiresAppId: true },
	'maximize-app': { requiresAppId: true },
	'close-app': { requiresAppId: true },

	// Desktop UI
	'open-start-menu': { requiresAppId: false },
	'open-quick-settings': { requiresAppId: false },
	'open-task-view': { requiresAppId: false },

	// File Explorer
	'create-folder': { requiresAppId: false },
	'select-file': { requiresAppId: false },
	'paste-copy': { requiresAppId: false },
	'paste-cut-file': { requiresAppId: false },
	'rename-file': { requiresAppId: false },
	'delete-file': { requiresAppId: false },
	'drag-drop-file': { requiresAppId: false },

	// Browser
	'new-tab': { requiresAppId: false },
	navigate: { requiresTargetUrl: false },
	'navigate-site': { requiresTargetUrl: true },
	search: { requiresAppId: false },
	'switch-tab': { requiresAppId: false },
	'close-tab': { requiresAppId: false },
	bookmark: { requiresTargetSite: false },
	'download-file': { requiresAppId: false },
	'zoom-page': { requiresAppId: false },
	'find-on-page': { requiresAppId: false },
	'open-privacy-settings': { requiresAppId: false },
	'type-ai-question': { requiresAppId: false },

	// Email
	'read-all-unread': { requiresAppId: false },
	'reply-email': { requiresAppId: false },
	'forward-email': { requiresAppId: false },
	'delete-email': { requiresAppId: false },
	'attach-file': { requiresAppId: false },
	'email-attachment': { requiresAppId: false },
	'download-attachment': { requiresAppId: false },

	// Spreadsheet
	'update-cell': { requiresAppId: false },
	'format-cell': { requiresAppId: false },
	'enter-formula': { requiresAppId: false },

	// Settings
	'connect-wifi': { requiresAppId: false },
	'add-printer': { requiresAppId: false },
	'install-app': { requiresAppId: false },
	'uninstall-app': { requiresAppId: false },
	'update-app': { requiresAppId: false },
	'connect-bluetooth': { requiresAppId: false },
	'open-display-settings': { requiresAppId: false },
	'open-accessibility': { requiresAppId: false },
	'open-sound-settings': { requiresAppId: false },

	// Security / Online services
	'identify-phishing': { requiresAppId: false },
	'handle-cookies': { requiresTargetChoice: true },
	'secure-login': { requiresAppId: false },
	'make-transfer': { requiresAppId: false },
	'gov-service': { requiresAppId: false },

	// Video call
	'start-videocall': { requiresAppId: false },
	'mute-call': { requiresAppId: false },
	'end-call': { requiresAppId: false },

	// Word Processor
	'update-text': { requiresAppId: false },
	'format-text-bold': { requiresAppId: false },
	'format-text-italic': { requiresAppId: false },
	'format-text-underline': { requiresAppId: false },
	'format-text-align': { requiresTargetAlign: true },
	'format-font-size': { requiresTargetSize: true },
	'insert-bullet-list': { requiresAppId: false },
	'save-document': { requiresAppId: false }
} as const;

export type GoalId = keyof typeof GOALS;

/** Checks whether a string is a registered GoalId. */
export function isValidGoalId(value: string): value is GoalId {
	return value in GOALS;
}
