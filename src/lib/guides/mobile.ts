import type { GuideDefinition } from './types';
import { mobileGuideConfig, type MobileVariant } from '$lib/db/seeds/mobile-track';

/**
 * «Android» and «iPhone»: one walk around the phone for both. The learner
 * opens an app, makes a call, goes home, sends a message, changes the text
 * size, joins WiFi and uses the pull-down panel. The rest is told, not tried.
 * The two guides share the steps; each has its own clips (`android.*`, `iphone.*`).
 */
function mobileGuide(variant: MobileVariant): GuideDefinition {
	const mod = variant === 'ios' ? 'iphone' : 'android';
	const ids = (...keys: string[]) => keys.map((k) => `${mod}-${k}`);
	return {
		id: mod,
		moduleId: mod,
		sim: 'phone',
		simConfig: mobileGuideConfig(variant),
		steps: [
			{ id: 'home', target: 'phone-screen', lessonIds: [] },
			{
				id: 'open',
				target: 'app-phone',
				lessonIds: ids(variant === 'ios' ? 'open-facetime' : 'open-viber'),
				task: { type: 'mobile-app-opened', where: { appId: 'phone' } }
			},
			{
				id: 'call',
				target: 'phone-screen',
				lessonIds: ids('call-number', 'call-contact'),
				task: { type: 'mobile-call-placed' }
			},
			{
				id: 'home-button',
				target: 'phone-home',
				lessonIds: [],
				task: { type: 'mobile-home' }
			},
			{
				id: 'message',
				target: 'app-messages',
				lessonIds: ids('send-sms', 'send-viber', 'viber-group'),
				task: { type: 'mobile-message-sent' }
			},
			{ id: 'videocall', target: 'phone-home', lessonIds: ids('videocall-viber') },
			{
				id: 'font-size',
				target: 'phone-home',
				lessonIds: ids('font-size'),
				task: { type: 'mobile-font-size-set' }
			},
			{
				id: 'wifi',
				target: 'phone-screen',
				lessonIds: ids('connect-wifi'),
				task: { type: 'mobile-wifi-connected' }
			},
			{
				id: 'quick',
				target: 'phone-statusbar',
				lessonIds: ids('quick-torch', 'night-mode'),
				task: { type: 'mobile-quick-toggle' }
			},
			{ id: 'screenshot', target: 'phone-screen', lessonIds: ids('screenshot') },
			{ id: 'camera', target: 'phone-home', lessonIds: ids('scan-qr') },
			{
				id: 'apps',
				target: 'phone-home',
				lessonIds: ids('update-app', 'install-app', 'force-close')
			},
			{
				id: 'assistant',
				target: 'phone-home',
				lessonIds: ids('assistant-alarm', 'assistant-reminder', 'assistant-ask')
			},
			{
				id: 'safety',
				target: 'phone-screen',
				lessonIds: ids('scam-sms', 'two-factor', 'find-device')
			}
		]
	};
}

export const androidGuide = mobileGuide('android');
export const iphoneGuide = mobileGuide('ios');
