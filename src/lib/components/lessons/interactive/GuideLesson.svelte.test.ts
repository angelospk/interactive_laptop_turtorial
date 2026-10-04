import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GuideLesson from './GuideLesson.svelte';

// Every clip "ends" at once, so the tour runs at click speed.
const nav = vi.hoisted(() => ({ invalidateAll: vi.fn(async () => {}) }));
vi.mock('$app/navigation', () => nav);

vi.mock('$lib/guides/audio', () => ({
	readingMs: () => 0,
	createGuideAudio: () => ({
		play: (_id: string, _caption: string, onEnd: () => void) => setTimeout(onEnd, 0),
		stop: () => {},
		setMuted: () => {}
	})
}));

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
const spotlight = () => document.querySelector('[data-testid="guide-spotlight"]');
const caption = (screen: Screen) => screen.getByTestId('guide-caption');

function mount(onComplete = vi.fn(), onBack = vi.fn()) {
	const screen = render(GuideLesson as never, { lesson, onComplete, onBack } as never);
	return { screen, onComplete, onBack };
}

async function start(screen: Screen) {
	await screen.getByRole('button', { name: 'Ξεκινάμε' }).click();
	await screen.getByRole('button', { name: 'Πάμε!' }).click();
}

describe('GuideLesson', () => {
	let fetchMock: ReturnType<typeof vi.fn>;
	beforeEach(() => {
		localStorage.removeItem('guide-muted');
		fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) }));
		vi.stubGlobal('fetch', fetchMock);
	});
	afterEach(() => vi.unstubAllGlobals());

	test('starts on a start screen, then the intro, then spotlights the first step', async () => {
		const { screen } = mount();
		await expect.element(screen.getByRole('button', { name: 'Ξεκινάμε' })).toBeInTheDocument();
		expect(spotlight()).toBeNull();
		await screen.getByRole('button', { name: 'Ξεκινάμε' }).click();
		await expect.element(caption(screen)).toHaveTextContent(/Πάμε;/);
		await screen.getByRole('button', { name: 'Πάμε!' }).click();
		await expect.element(screen.getByText('Βήμα 1 από 11')).toBeInTheDocument();
		await expect.element(caption(screen)).toHaveTextContent(/καρτέλες/);
		await vi.waitFor(() => expect(spotlight()?.getAttribute('data-target')).toBe('tabs'));
	});

	test('«Το ξέρω» saves the step’s exercises and moves on by itself', async () => {
		const { screen } = mount();
		await start(screen);
		await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		await expect.element(screen.getByText('Βήμα 2 από 11')).toBeInTheDocument();
		await vi.waitFor(() => expect(spotlight()?.getAttribute('data-target')).toBe('new-tab'));
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('/api/lessons/guide-answers');
		expect(JSON.parse(init.body)).toEqual({
			guideLessonId: 'module5-guide',
			answers: { 'module5-lesson4': 'known' }
		});
	});

	test('runs to the end: a summary, then Συνέχεια completes the guide', async () => {
		const { screen, onComplete } = mount();
		await start(screen);
		await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		for (let i = 2; i <= 11; i++) {
			await expect.element(screen.getByText(`Βήμα ${i} από 11`)).toBeInTheDocument();
			await screen.getByRole('button', { name: 'Δεν το ξέρω' }).click();
		}
		await expect
			.element(screen.getByRole('heading', { name: 'Ξέρατε 1 από τα 11' }))
			.toBeInTheDocument();
		// Every step stands for at least one exercise (Αναζήτηση for two), so each saves once.
		expect(fetchMock).toHaveBeenCalledTimes(11);
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100, expect.any(Array)));
	});

	async function runToEnd(screen: Screen) {
		await start(screen);
		await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		for (let i = 2; i <= 11; i++) {
			await expect.element(screen.getByText(`Βήμα ${i} από 11`)).toBeInTheDocument();
			await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		}
		await expect.element(screen.getByRole('heading', { name: /Ξέρατε/ })).toBeInTheDocument();
	}

	test('Συνέχεια refreshes progress before completing, so Next sees the new green lessons', async () => {
		const { screen, onComplete } = mount();
		await runToEnd(screen);
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalled());
		expect(nav.invalidateAll).toHaveBeenCalled();
		expect(nav.invalidateAll.mock.invocationCallOrder[0]).toBeLessThan(
			onComplete.mock.invocationCallOrder[0]
		);
	});

	test('answers that cannot be saved are named, and Συνέχεια waits until they are', async () => {
		fetchMock.mockImplementation(async () => ({ ok: false, json: async () => ({}) }));
		const { screen, onComplete } = mount();
		await runToEnd(screen);
		await expect.element(screen.getByRole('alert')).toHaveTextContent(/δεν αποθηκεύτηκαν/);
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await expect.element(screen.getByRole('alert')).toHaveTextContent(/δεν αποθηκεύτηκαν/);
		expect(onComplete).not.toHaveBeenCalled();

		fetchMock.mockImplementation(async () => ({ ok: true, json: async () => ({}) }));
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100, expect.any(Array)));
	});

	test('a refresh that fails keeps the guide open instead of completing on old progress', async () => {
		nav.invalidateAll.mockRejectedValueOnce(new Error('offline'));
		const { screen, onComplete } = mount();
		await runToEnd(screen);
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await expect.element(screen.getByRole('alert')).toHaveTextContent(/δεν ανανεώθηκε/);
		expect(onComplete).not.toHaveBeenCalled();
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100, expect.any(Array)));
	});

	test('answers that failed are all sent, once, when the network is back', async () => {
		const sent: Record<string, string>[] = [];
		let online = false;
		fetchMock.mockImplementation(async (_url: string, init: { body: string }) => {
			if (online) sent.push(JSON.parse(init.body).answers);
			return { ok: online, json: async () => ({}) };
		});
		const { screen, onComplete } = mount();
		await runToEnd(screen);
		online = true;
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalled());
		const ids = sent.flatMap((answers) => Object.keys(answers));
		expect(ids).toHaveLength(12);
		expect(new Set(ids).size).toBe(12);
		expect(sent.every((answers) => Object.values(answers).every((v) => v === 'known'))).toBe(true);
	});

	test('Συνέχεια waits for a save still in flight, and its retry, before completing', async () => {
		let release!: (res: { ok: boolean; json: () => Promise<object> }) => void;
		const saved: string[] = [];
		fetchMock.mockImplementation(async (_url: string, init: { body: string }) => {
			const ids = Object.keys(JSON.parse(init.body).answers);
			// The last exercise's first attempt hangs, then fails.
			if (ids.includes('module5-lesson10') && !release) {
				return new Promise((resolve) => (release = resolve));
			}
			saved.push(...ids);
			return { ok: true, json: async () => ({}) };
		});
		const { screen, onComplete } = mount();
		await runToEnd(screen);
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await vi.waitFor(() => expect(release).toBeDefined());
		expect(onComplete).not.toHaveBeenCalled();
		release({ ok: false, json: async () => ({}) });
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100, expect.any(Array)));
		expect(saved.filter((id) => id === 'module5-lesson10')).toHaveLength(1);
		expect(new Set(saved).size).toBe(12);
	});

	test('the start screen holds the keyboard: the demo behind it cannot be tabbed into', async () => {
		const { screen } = mount();
		await expect.element(screen.getByRole('button', { name: 'Ξεκινάμε' })).toHaveFocus();
		expect(document.querySelector('[data-guide="address-bar"]')?.closest('[inert]')).not.toBeNull();
		await screen.getByRole('button', { name: 'Ξεκινάμε' }).click();
		expect(document.querySelector('[data-guide="address-bar"]')?.closest('[inert]')).toBeNull();
	});

	test('the summary takes focus when the tour ends', async () => {
		const { screen } = mount();
		await runToEnd(screen);
		await expect.element(screen.getByRole('heading', { name: /Ξέρατε/ })).toHaveFocus();
	});

	test('what the learner does in the demo stays put from one step to the next', async () => {
		const { screen } = mount();
		await start(screen);
		await screen.getByText('Ειδήσεις', { exact: true }).click();
		await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		await expect.element(screen.getByText('Βήμα 2 από 11')).toBeInTheDocument();
		// Still on the news page: the step change did not reload the demo.
		expect(document.querySelector('[data-guide="search"]')).toBeNull();
	});

	test('a step whose element the learner navigated away from brings the demo back', async () => {
		const { screen } = mount();
		await start(screen);
		// Step 1: the learner opens the news tab, so the Google box of step 6 is gone.
		await screen.getByText('Ειδήσεις', { exact: true }).click();
		expect(document.querySelector('[data-guide="search"]')).toBeNull();
		for (let i = 1; i <= 5; i++) {
			await expect.element(screen.getByText(`Βήμα ${i} από 11`)).toBeInTheDocument();
			await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		}
		await expect.element(screen.getByText('Βήμα 6 από 11')).toBeInTheDocument();
		await vi.waitFor(() => expect(spotlight()?.getAttribute('data-target')).toBe('search'));
		expect(document.querySelector('[data-guide="search"]')).not.toBeNull();
	});

	test('download, zoom and find each spotlight their own control, not the whole page', async () => {
		const { screen } = mount();
		await start(screen);
		for (let i = 1; i <= 8; i++) {
			await expect.element(screen.getByText(`Βήμα ${i} από 11`)).toBeInTheDocument();
			await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		}
		for (const [i, target] of [
			[9, 'download'],
			[10, 'zoom'],
			[11, 'find']
		] as const) {
			await expect.element(screen.getByText(`Βήμα ${i} από 11`)).toBeInTheDocument();
			await vi.waitFor(() => expect(spotlight()?.getAttribute('data-target')).toBe(target));
			expect(document.querySelector(`[data-guide="${target}"]`)).not.toBeNull();
			if (i < 11) await screen.getByRole('button', { name: /Το ξέρω/ }).click();
		}
	});

	test('no idle help: nothing is timed to speak over a learner who waits', async () => {
		const timers = vi.spyOn(window, 'setTimeout');
		try {
			const { screen } = mount();
			await start(screen);
			await expect.element(caption(screen)).toHaveTextContent(/καρτέλες/);
			await screen.getByRole('button', { name: /Το ξέρω/ }).click();
			await expect.element(screen.getByText('Βήμα 2 από 11')).toBeInTheDocument();
			// The old watcher armed 30 s and 75 s nudges on every step.
			const long = timers.mock.calls.filter(([, ms]) => (ms ?? 0) >= 30_000);
			expect(long).toEqual([]);
		} finally {
			timers.mockRestore();
		}
	});

	test('the mute button is remembered', async () => {
		const { screen } = mount();
		await screen.getByRole('button', { name: 'Σίγαση' }).click();
		await expect
			.element(screen.getByRole('button', { name: 'Άνοιγμα φωνής' }))
			.toHaveAttribute('aria-pressed', 'true');
		expect(localStorage.getItem('guide-muted')).toBe('1');
	});

	test('Έξοδος leaves at any point', async () => {
		const { screen, onBack } = mount();
		await start(screen);
		await screen.getByRole('button', { name: 'Έξοδος' }).click();
		expect(onBack).toHaveBeenCalled();
	});
});
