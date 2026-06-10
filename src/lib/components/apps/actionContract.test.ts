import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Contract lock: τα simulated apps πυροδοτούν onAction(action, data) events που
 * τα goalHandlers αντιστοιχίζουν σε lessons. Αν αφαιρεθεί ή μετονομαστεί ένα
 * action, σπάνε υπάρχοντα μαθήματα. Το test κλειδώνει το σύνολο των actions
 * ανά αρχείο — προσθήκες επιτρέπονται μόνο συνειδητά (ενημέρωσε τη λίστα).
 */

const APPS_DIR = resolve(__dirname);
const DESKTOP_DIR = resolve(__dirname, '../desktop');

const LOCKED_ACTIONS: Record<string, { dir: string; actions: string[] }> = {
	'BrowserApp.svelte': {
		dir: APPS_DIR,
		actions: [
			'bank-login',
			'bank-transfer',
			'bookmark',
			'close-tab',
			'cookie-choice',
			'download-file',
			'find-on-page',
			'gov-submit',
			'navigate',
			'new-tab',
			'open-privacy-settings',
			'search',
			'switch-tab',
			'type-ai-question',
			'zoom-page'
		]
	},
	'EmailApp.svelte': {
		dir: APPS_DIR,
		actions: [
			'attach-file',
			'delete-email',
			'download-attachment',
			'forward-email',
			'read-all-unread-complete',
			'read-email',
			'reply-email',
			'report-phishing',
			'send-email'
		]
	},
	'FileExplorerApp.svelte': {
		dir: APPS_DIR,
		actions: [
			'create-folder',
			'delete',
			'drag-drop',
			'navigate',
			'paste-copy',
			'paste-cut',
			'rename',
			'select-file'
		]
	},
	'InstallerApp.svelte': {
		dir: APPS_DIR,
		actions: ['cancel', 'finish', 'install-complete']
	},
	'SettingsApp.svelte': {
		dir: APPS_DIR,
		actions: [
			'add-printer',
			'change-volume',
			'connect-bluetooth',
			'connect-wifi',
			'open-accessibility',
			'open-bluetooth-settings',
			'open-display-settings',
			'open-sound-settings',
			'toggle-wifi',
			'uninstall-app',
			'update-app'
		]
	},
	'SpreadsheetApp.svelte': {
		dir: APPS_DIR,
		actions: ['format-cell', 'formula-success', 'select-cell', 'update-cell']
	},
	'VideoCallApp.svelte': {
		dir: APPS_DIR,
		actions: ['end-call', 'mute-call', 'start-videocall']
	},
	'WordProcessorApp.svelte': {
		dir: APPS_DIR,
		actions: [
			'format-align',
			'format-bold',
			'format-font-size',
			'format-italic',
			'format-underline',
			'insert-bullet-list',
			'save-document',
			'update-text'
		]
	}
};

function extractActions(source: string): Set<string> {
	const matches = source.matchAll(/onAction\(\s*'([a-z-]+)'/g);
	return new Set([...matches].map((m) => m[1]));
}

describe('simulated app onAction contract', () => {
	for (const [file, { dir, actions }] of Object.entries(LOCKED_ACTIONS)) {
		test(`${file} εκπέμπει όλα τα κλειδωμένα actions`, () => {
			const source = readFileSync(resolve(dir, file), 'utf-8');
			const found = extractActions(source);
			const missing = actions.filter((a) => !found.has(a));
			expect(missing).toEqual([]);
		});

		test(`${file} δεν εκπέμπει νέα actions εκτός λίστας`, () => {
			const source = readFileSync(resolve(dir, file), 'utf-8');
			const found = extractActions(source);
			const unexpected = [...found].filter((a) => !actions.includes(a));
			expect(unexpected).toEqual([]);
		});
	}
});
