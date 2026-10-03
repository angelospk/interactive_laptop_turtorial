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
		// The informational step (Πίσω/Μπροστά) has no exercise to save.
		expect(fetchMock).toHaveBeenCalledTimes(10);
		await screen.getByRole('button', { name: 'Συνέχεια' }).click();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100));
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
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100));
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
