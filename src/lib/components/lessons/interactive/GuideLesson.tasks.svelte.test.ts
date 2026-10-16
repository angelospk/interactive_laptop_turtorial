import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GuideLesson from './GuideLesson.svelte';

// «Δοκιμάστε το»: a practical step waits for the learner to do the thing in the demo.

vi.mock('$app/navigation', () => ({ invalidateAll: vi.fn(async () => {}) }));
// Like the real player: a new clip or stop() cancels the ending of the last one.
vi.mock('$lib/guides/audio', () => ({
	readingMs: () => 0,
	createGuideAudio: () => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		return {
			play: (_id: string, _caption: string, onEnd: () => void) => {
				clearTimeout(timer);
				timer = setTimeout(onEnd, 0);
			},
			stop: () => clearTimeout(timer),
			setMuted: () => {}
		};
	}
}));

// The module5 guide, cut to one practical step and one ordinary one; the
// browser and module5's own clips do the rest.
vi.mock('$lib/guides', async (importOriginal) => {
	const real = await importOriginal<typeof import('$lib/guides')>();
	return {
		...real,
		guides: {
			module5: {
				...real.guides.module5,
				steps: [
					{
						id: 'new-tab',
						target: 'new-tab',
						lessonIds: ['module5-lesson1'],
						task: { type: 'new-tab' }
					},
					{ id: 'tabs', target: 'tabs', lessonIds: ['module5-lesson4'] },
					{
						id: 'close-tab',
						target: 'new-tab',
						lessonIds: ['module5-lesson5'],
						task: { type: 'new-tab' }
					},
					{ id: 'bookmark', target: 'new-tab', lessonIds: [], task: { type: 'new-tab' } },
					{ id: 'history', target: 'new-tab', lessonIds: [], task: { type: 'new-tab' } },
					{ id: 'zoom', target: 'zoom', lessonIds: [] }
				]
			}
		}
	};
});

const lesson = {
	id: 'module5-guide',
	moduleId: 'module5',
	lessonKey: 'guide',
	titleKey: 'module5_guide_title',
	descriptionKey: null,
	difficulty: 'beginner',
	orderIndex: 0,
	lessonType: 'guide',
	config: { guideId: 'module5' },
	enabled: true,
	requiredLessonId: null
};

type Screen = ReturnType<typeof render>;

async function start() {
	const screen = render(
		GuideLesson as never,
		{
			lesson,
			onComplete: vi.fn(),
			onBack: vi.fn()
		} as never
	);
	await screen.getByRole('button', { name: 'Ξεκινάμε' }).click();
	await screen.getByRole('button', { name: 'Πάμε!' }).click();
	return screen;
}

const sent = (fetchMock: ReturnType<typeof vi.fn>) =>
	fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).answers);

describe('GuideLesson: practical steps', () => {
	let fetchMock: ReturnType<typeof vi.fn>;
	beforeEach(() => {
		fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) }));
		vi.stubGlobal('fetch', fetchMock);
	});
	afterEach(() => vi.unstubAllGlobals());

	test('asks the learner to try it, with Βοήθεια and Παράλειψη instead of Το ξέρω', async () => {
		const screen = await start();
		await expect.element(screen.getByText('Δοκιμάστε το εσείς')).toBeVisible();
		await expect.element(screen.getByRole('button', { name: 'Βοήθεια' })).toBeVisible();
		await expect.element(screen.getByRole('button', { name: 'Παράλειψη' })).toBeVisible();
		expect(screen.getByRole('button', { name: /Το ξέρω/ }).elements()).toHaveLength(0);
	});

	test('Βοήθεια says the step hint', async () => {
		const screen = await start();
		await screen.getByRole('button', { name: 'Βοήθεια' }).click();
		await expect.element(screen.getByTestId('guide-caption')).toHaveTextContent(/σταυρουδάκι/);
	});

	test('doing it in the demo counts as known and moves on', async () => {
		const screen = await start();
		(document.querySelector('[data-guide="new-tab"]') as HTMLElement).click();
		await expect.element(screen.getByText('Βήμα 2 από 6')).toBeInTheDocument();
		await vi.waitFor(() => expect(sent(fetchMock)).toEqual([{ 'module5-lesson1': 'known' }]));
		// The next, ordinary step has the usual answers again.
		await expect.element(screen.getByRole('button', { name: /Το ξέρω/ })).toBeVisible();
	});

	test('Παράλειψη moves on as not known', async () => {
		const screen: Screen = await start();
		await screen.getByRole('button', { name: 'Παράλειψη' }).click();
		await expect.element(screen.getByText('Βήμα 2 από 6')).toBeInTheDocument();
		await vi.waitFor(() => expect(sent(fetchMock)).toEqual([{ 'module5-lesson1': 'unknown' }]));
	});

	test('a learner who is ahead: what they did during the «well done» counts for the next step', async () => {
		const screen = await start();
		await screen.getByRole('button', { name: 'Παράλειψη' }).click();
		await expect.element(screen.getByText('Βήμα 2 από 6')).toBeInTheDocument();
		await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		await expect.element(screen.getByText('Βήμα 3 από 6')).toBeInTheDocument();
		// Two quick clicks: the second lands while the first one's feedback plays.
		const plus = document.querySelector('[data-guide="new-tab"]') as HTMLElement;
		plus.click();
		plus.click();
		await expect.element(screen.getByText('Βήμα 5 από 6')).toBeInTheDocument();
	});

	test('everything the learner did during the feedback is kept, not just the first match', async () => {
		const screen = await start();
		await screen.getByRole('button', { name: 'Παράλειψη' }).click();
		await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		await expect.element(screen.getByText('Βήμα 3 από 6')).toBeInTheDocument();
		// Three quick clicks: one solves step 3, the next two arrive during its
		// feedback; the first of those solves step 4, the last one step 5.
		const plus = document.querySelector('[data-guide="new-tab"]') as HTMLElement;
		plus.click();
		plus.click();
		plus.click();
		await expect.element(screen.getByText('Βήμα 6 από 6')).toBeInTheDocument();
	});
});
