import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MobileSimLesson from './MobileSimLesson.svelte';
import { mobileGuideConfig } from '$lib/db/seeds/mobile-track';

// The android and iphone guides embed the phone: every event goes out, and the
// phone never scores, completes or shows a lesson frame of its own.

const lesson = (variant: 'android' | 'ios') =>
	({
		id: 'guide-phone',
		moduleId: '',
		lessonKey: 'guide-sim',
		titleKey: '',
		lessonType: 'mobile-sim',
		config: mobileGuideConfig(variant)
	}) as never;

// The guide gives the phone a stage of fixed height, shorter than the phone.
let last: HTMLElement;
const stageBottom = () => last.getBoundingClientRect().bottom;

function stage(width?: string) {
	const el = document.createElement('div');
	el.style.height = '500px';
	if (width) el.style.width = width;
	document.body.appendChild(el);
	last = el;
	return el;
}

describe('MobileSimLesson embedded', () => {
	it('reports app opens and shows the app, with no lesson frame', async () => {
		const onEvent = vi.fn();
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, {
			target: stage(),
			props: { lesson: lesson('android'), embedded: true, onEvent, onComplete, onBack: vi.fn() }
		} as never);
		await screen.getByRole('button', { name: 'Άνοιγμα Τηλέφωνο' }).first().click();
		expect(onEvent).toHaveBeenCalledWith('mobile-app-opened', { appId: 'phone' });
		expect(document.querySelector('[data-guide="phone-home"]')).not.toBeNull();
		// The guide card speaks for the lesson: no prompt of the phone's own.
		expect(screen.getByText(mobileGuideConfig('android').prompt).elements()).toHaveLength(0);
		expect(onComplete).not.toHaveBeenCalled();
		// The whole phone fits the stage: it shrinks instead of scrolling.
		const home = document.querySelector('[data-guide="phone-home"]')!.getBoundingClientRect();
		expect(home.bottom).toBeLessThanOrEqual(stageBottom());

		await screen.getByRole('button', { name: 'Αρχική οθόνη' }).click();
		expect(onEvent).toHaveBeenCalledWith('mobile-home', {});
	});

	it('never completes, even when the learner does the config goal', async () => {
		const onEvent = vi.fn();
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, {
			target: stage(),
			props: { lesson: lesson('android'), embedded: true, onEvent, onComplete, onBack: vi.fn() }
		} as never);
		// The config goal is mobile-dial-number with no number: any call matches it.
		await screen.getByRole('button', { name: 'Άνοιγμα Τηλέφωνο' }).first().click();
		await screen.getByRole('button', { name: 'Ψηφίο 6' }).click();
		await screen.getByRole('button', { name: 'Κλήση' }).click();
		expect(onEvent).toHaveBeenCalledWith('mobile-call-placed', expect.anything());
		// A lesson completes 900ms after its goal.
		await new Promise((r) => setTimeout(r, 1200));
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('also shrinks to fit a narrow stage', async () => {
		render(MobileSimLesson, {
			target: stage('200px'),
			props: {
				lesson: lesson('android'),
				embedded: true,
				onEvent: vi.fn(),
				onComplete: vi.fn(),
				onBack: vi.fn()
			}
		} as never);
		await vi.waitFor(() => {
			const frame = document.querySelector('[data-guide="phone-screen"]')!.getBoundingClientRect();
			expect(frame.right).toBeLessThanOrEqual(last.getBoundingClientRect().right);
		});
	});

	it('has the pull-down panel and the side buttons a guide talks about', () => {
		render(MobileSimLesson, {
			lesson: lesson('ios'),
			embedded: true,
			onEvent: vi.fn(),
			onComplete: vi.fn(),
			onBack: vi.fn()
		} as never);
		expect(document.querySelector('[data-guide="phone-statusbar"]')).not.toBeNull();
		expect(document.querySelector('[data-guide^="bezel-"]')).not.toBeNull();
	});
});
