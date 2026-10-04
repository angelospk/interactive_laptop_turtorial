import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LessonRunner from './LessonRunner.svelte';
import LessonRunnerHarness from './LessonRunner.harness.svelte';

const mockLessons = [
	{
		id: 'lesson-1',
		lessonKey: 'hover-balloons',
		lessonType: 'hover',
		titleKey: 'Μάθημα 1',
		descriptionKey: '',
		config: { theme: 'balloons', targetCount: 3, timeLimit: 30 },
		enabled: true,
		orderIndex: 0,
		moduleId: 'module-1',
		difficulty: 'beginner'
	},
	{
		id: 'lesson-2',
		lessonKey: 'click-moles',
		lessonType: 'click',
		titleKey: 'Μάθημα 2',
		descriptionKey: '',
		config: { theme: 'moles', targetCount: 3, timeLimit: 30 },
		enabled: true,
		orderIndex: 1,
		moduleId: 'module-1',
		difficulty: 'beginner'
	},
	{
		id: 'lesson-3',
		lessonKey: 'drag-recycle',
		lessonType: 'drag',
		titleKey: 'Μάθημα 3',
		descriptionKey: '',
		config: { theme: 'recycle', itemCount: 3, dropZones: 3 },
		enabled: true,
		orderIndex: 2,
		moduleId: 'module-1',
		difficulty: 'beginner'
	}
];

type Screen = ReturnType<typeof render>;

/** The title heading — plain text would also match the "Μάθημα N από 3" counter. */
const title = (screen: Screen, name: string) => screen.getByRole('heading', { name });

const mount = (props: Record<string, unknown> = {}) =>
	render(
		LessonRunner as never,
		{
			lessons: mockLessons,
			progress: {},
			startIndex: 0,
			moduleId: 'module-1',
			...props
		} as never
	);

describe('LessonRunner navigation', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ progress: { completed: true, score: 100 } })
				})
			)
		);
	});

	afterEach(() => vi.unstubAllGlobals());

	test('renders the lesson named by startIndex, not always the first', async () => {
		const screen = mount({ startIndex: 1 });
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
	});

	// bd-afz: advancing used to go through setTimeout(…, 10) "to prevent
	// reactive jump bugs". One click, one lesson, no timers.
	test('Next advances exactly one lesson', async () => {
		const screen = mount();
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
		await screen.getByRole('button', { name: /Επόμενο/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
	});

	test('Previous goes back exactly one lesson', async () => {
		const screen = mount({ startIndex: 2 });
		await screen.getByRole('button', { name: /Προηγούμενο/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
	});

	// A missing catalogue entry read out as "lesson_nav_aria" to screen readers.
	test('names the lesson navigation for a screen reader', async () => {
		const screen = mount();
		await expect
			.element(screen.getByRole('navigation', { name: 'Πλοήγηση μαθήματος' }))
			.toBeInTheDocument();
	});

	test('Previous is disabled on the first lesson', async () => {
		const screen = mount();
		await expect.element(screen.getByRole('button', { name: /Προηγούμενο/ })).toBeDisabled();
	});
});

// The route keeps the URL in step with `replaceState`, which is *shallow*: it
// rewrites the address bar but leaves `params.lesson` at whatever the last real
// navigation matched. So every `invalidateAll()` re-runs the server load with
// the lesson the learner arrived on and hands the runner that stale
// `startIndex`. These tests pin the observable consequence the learner reported:
// finishing a lesson teleported them backwards, and the countdown then advanced
// from the wrong place.
describe('LessonRunner stays on the lesson the learner is on', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ progress: { completed: true, score: 100 } })
				})
			)
		);
	});

	afterEach(() => vi.unstubAllGlobals());

	const mountHarness = (props: Record<string, unknown> = {}) =>
		render(
			LessonRunnerHarness as never,
			{
				lessons: mockLessons,
				progress: {},
				startIndex: 0,
				moduleId: 'module-1',
				...props
			} as never
		);

	test('a load re-run with a stale startIndex does not teleport the learner back', async () => {
		const screen = mountHarness();
		await screen.getByRole('button', { name: /Επόμενο/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();

		// invalidateAll(): same params, fresh data object, startIndex still 0.
		(screen.component as unknown as { reload: (i?: number) => void }).reload(0);

		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
	});

	test('a genuinely new startIndex (real navigation) still wins', async () => {
		const screen = mountHarness();
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();

		(screen.component as unknown as { reload: (i?: number) => void }).reload(2);

		await expect.element(title(screen, 'Μάθημα 3')).toBeInTheDocument();
	});

	// Next rewrites the address bar with a *shallow* replaceState, which leaves the
	// route params — and so startIndex — at the arrival lesson. A real navigation
	// back to that lesson therefore re-emits the very same number, and must still
	// be honoured.
	test('a real navigation back to the arrival lesson still wins', async () => {
		const screen = mountHarness();
		const runner = screen.component as unknown as { navigate: (i: number) => void };

		await screen.getByRole('button', { name: /Επόμενο/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();

		runner.navigate(0);
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
	});

	// The result overlay belongs to a lesson just finished. Navigating away and
	// back is not finishing it again, so the overlay must not come back with it.
	test('a real navigation away and back does not bring back the result overlay', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				json: async () => ({ progress: { completed: true, score: 100 } })
			}))
		);
		const clickFirstLessons = [
			{
				...mockLessons[1],
				id: 'lesson-click',
				titleKey: 'Μάθημα 1',
				config: { theme: 'default', targetCount: 1 }
			},
			{ ...mockLessons[1], id: 'lesson-2b', titleKey: 'Μάθημα 2' },
			mockLessons[2]
		];
		const screen = mountHarness({ lessons: clickFirstLessons });
		const runner = screen.component as unknown as { navigate: (i: number) => void };
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await expect.element(screen.getByRole('button', { name: 'Δοκίμασε ξανά' })).toBeInTheDocument();

		runner.navigate(1);
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
		runner.navigate(0);
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
		await expect
			.element(screen.getByRole('button', { name: 'Δοκίμασε ξανά' }))
			.not.toBeInTheDocument();
	});

	test('one click on Next reports exactly one lesson change', async () => {
		const changes: string[] = [];
		const screen = mountHarness({ onLessonChange: (key: string) => changes.push(key) });

		await screen.getByRole('button', { name: /Επόμενο/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();

		expect(changes).toEqual(['click-moles']);
	});

	test('a load re-run reports no lesson change of its own', async () => {
		const changes: string[] = [];
		const screen = mountHarness({ onLessonChange: (key: string) => changes.push(key) });

		await screen.getByRole('button', { name: /Επόμενο/ }).click();
		(screen.component as unknown as { reload: (i?: number) => void }).reload(0);
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();

		expect(changes).toEqual(['click-moles']);
	});
});

// Saving progress is a round trip. If the learner presses Επόμενο while it is in
// flight, the response comes back into a component that has already moved on —
// and the runner used to write it against whatever lesson was on screen by then,
// marking an unplayed lesson complete and arming the countdown from there.
describe('a save that outlives its lesson', () => {
	const clickFirst = [
		{
			...mockLessons[1],
			id: 'lesson-click',
			titleKey: 'Μάθημα 1',
			config: { theme: 'default', targetCount: 1, timeLimit: 45 }
		},
		{ ...mockLessons[1], id: 'lesson-2b', titleKey: 'Μάθημα 2' },
		{ ...mockLessons[2], titleKey: 'Μάθημα 3' }
	];

	afterEach(() => vi.unstubAllGlobals());

	// Retry while the save is still in flight: the late reply used to restore the
	// progress and start a countdown behind the learner's back, and the save could
	// reach the server after the delete, leaving the lesson marked complete.
	test('Retry during a save wins: no hidden countdown, and the delete lands last', async () => {
		let release!: (value: unknown) => void;
		const pending = new Promise((resolve) => (release = resolve));
		const order: string[] = [];
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string) => {
				if (url.includes('complete')) await pending;
				order.push(url);
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickFirst, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await new Promise((resolve) => setTimeout(resolve, 2400));
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();

		release({});
		await new Promise((resolve) => setTimeout(resolve, 6500));

		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
		await expect
			.element(screen.getByRole('button', { name: 'Δοκίμασε ξανά' }))
			.not.toBeInTheDocument();
		expect(order).toEqual(['/api/lessons/complete', '/api/lessons/delete-progress']);
	});

	// Two saves in flight: the first lesson's late reply used to clear the overlay
	// of the lesson the learner had just finished next.
	test('a late save of the previous lesson leaves the new result on screen', async () => {
		const twoClicks = [
			clickFirst[0],
			{ ...clickFirst[0], id: 'lesson-click-2', lessonKey: 'click-two', titleKey: 'Μάθημα 2' },
			clickFirst[2]
		];
		let release!: (value: unknown) => void;
		const pending = new Promise((resolve) => (release = resolve));
		let calls = 0;
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				if (calls++ === 0) await pending;
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: twoClicks, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await new Promise((resolve) => setTimeout(resolve, 2400));
		await screen.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await new Promise((resolve) => setTimeout(resolve, 2400));
		await expect.element(screen.getByRole('button', { name: 'Δοκίμασε ξανά' })).toBeInTheDocument();

		release({});
		await new Promise((resolve) => setTimeout(resolve, 400));
		await expect.element(screen.getByRole('button', { name: 'Δοκίμασε ξανά' })).toBeInTheDocument();
	});

	// The reply can arrive before its body does. Retry pressed while the body was
	// still being read must win just the same.
	test('Retry while the reply body is still arriving: no hidden countdown', async () => {
		let release!: (value: unknown) => void;
		const body = new Promise((resolve) => (release = resolve));
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				json: async () => {
					await body;
					return { progress: { completed: true, score: 100 } };
				}
			}))
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickFirst, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await new Promise((resolve) => setTimeout(resolve, 2400));
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();
		release({});
		await new Promise((resolve) => setTimeout(resolve, 6500));
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
	});

	// Retry cleared the progress but left the finished drill on screen, so
	// "Δοκίμασε ξανά" appeared to do nothing.
	test('Retry gives the learner a fresh, playable lesson', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				json: async () => ({ progress: { completed: true, score: 100 } })
			}))
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickFirst, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await new Promise((resolve) => setTimeout(resolve, 2400));
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();
		await expect.element(screen.getByRole('button', { name: 'CLICK' })).toBeInTheDocument();
		await expect.element(screen.getByText(/0\/1/)).toBeInTheDocument();
	});

	// Retry hands back a fresh drill at once, but its delete is still on the way.
	// A quick second attempt used to be saved first and then wiped by that delete.
	test('a quick new attempt after Retry is saved after the reset, not wiped by it', async () => {
		let releaseDelete!: (value: unknown) => void;
		const deleting = new Promise((resolve) => (releaseDelete = resolve));
		const order: string[] = [];
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string) => {
				if (url.includes('delete')) await deleting;
				order.push(url);
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickFirst, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await new Promise((resolve) => setTimeout(resolve, 2400));
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await new Promise((resolve) => setTimeout(resolve, 2400));

		releaseDelete({});
		await vi.waitFor(() => expect(order).toHaveLength(3));
		expect(order).toEqual([
			'/api/lessons/complete',
			'/api/lessons/delete-progress',
			'/api/lessons/complete'
		]);
	});

	// Finishing one lesson must not cancel the save of another. A retried lesson's
	// new result, still waiting for the reset, used to be dropped for good the
	// moment the learner finished the next lesson.
	test('finishing the next lesson does not drop a save still waiting its turn', async () => {
		const twoClicks = [
			clickFirst[0],
			{ ...clickFirst[0], id: 'lesson-click-2', lessonKey: 'click-two', titleKey: 'Μάθημα 2' },
			clickFirst[2]
		];
		let releaseDelete!: (value: unknown) => void;
		const deleting = new Promise((resolve) => (releaseDelete = resolve));
		const saved: string[] = [];
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string, init: { body: string }) => {
				if (url.includes('delete')) await deleting;
				else saved.push(JSON.parse(init.body).lessonId);
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: twoClicks, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		const play = async () => {
			await screen.getByRole('button', { name: 'CLICK' }).click();
			await new Promise((resolve) => setTimeout(resolve, 2400));
		};
		await play();
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();
		await play(); // waits for the reset
		await screen.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();
		await play();

		releaseDelete({});
		await vi.waitFor(() => expect(saved).toHaveLength(3));
		expect(saved.filter((id) => id === 'lesson-click')).toHaveLength(2);
		expect(saved).toContain('lesson-click-2');
	});

	// Played twice with the first save still out: Retry waited only for the
	// newest save, so the older one could land after the delete and bring the
	// result back. Now the second save queues behind the first, is dropped by
	// the Retry, and nothing lands after the delete.
	test('Retry waits for every save of the lesson, not just the newest', async () => {
		const releases: ((value: unknown) => void)[] = [];
		const events: string[] = [];
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string) => {
				if (url.includes('complete')) {
					await new Promise((resolve) => releases.push(resolve));
					events.push('saved');
				} else {
					events.push('deleted');
				}
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickFirst, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		const play = async () => {
			await screen.getByRole('button', { name: 'CLICK' }).click();
			await new Promise((resolve) => setTimeout(resolve, 2400));
		};
		await play();
		await screen.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();
		await screen.getByRole('button', { name: 'Προηγούμενο', exact: true }).click();
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
		await play();
		await vi.waitFor(() => expect(releases).toHaveLength(1));
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();

		releases[0]({});
		await vi.waitFor(() => expect(events.at(-1)).toBe('deleted'));
		await new Promise((resolve) => setTimeout(resolve, 300));
		releases.slice(1).forEach((release) => release({}));
		await new Promise((resolve) => setTimeout(resolve, 300));
		expect(events).toEqual(['saved', 'deleted']);
	});

	// Retry twice: the second delete did not wait for the first, so a new result
	// saved in between could be wiped by the older delete landing late.
	test('every request for a lesson reaches the server in the order it was made', async () => {
		let releaseFirstDelete!: (value: unknown) => void;
		const firstDelete = new Promise((resolve) => (releaseFirstDelete = resolve));
		let deletes = 0;
		const events: string[] = [];
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string) => {
				const isDelete = url.includes('delete');
				if (isDelete && deletes++ === 0) await firstDelete;
				events.push(isDelete ? 'deleted' : 'saved');
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickFirst, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		const play = async () => {
			await screen.getByRole('button', { name: 'CLICK' }).click();
			await new Promise((resolve) => setTimeout(resolve, 2400));
		};
		await play();
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();
		await play();
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();
		await play();

		releaseFirstDelete({});
		await vi.waitFor(() => expect(events).toHaveLength(4));
		expect(events).toEqual(['saved', 'deleted', 'deleted', 'saved']);
	});

	// Replaying straight after Retry, with the delete still on its way: the new
	// result shows, and its save reaches the server after the reset, not before.
	test('a replay straight after Retry shows its result and is saved after the reset', async () => {
		let releaseDelete!: (value: unknown) => void;
		const deleting = new Promise((resolve) => (releaseDelete = resolve));
		const order: string[] = [];
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string) => {
				if (url.includes('delete')) await deleting;
				order.push(url.includes('delete') ? 'deleted' : 'saved');
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{
				lessons: clickFirst,
				progress: { 'lesson-click': { completed: true, score: 100 } },
				startIndex: 0,
				moduleId: 'module-1'
			} as never
		);
		const play = async () => {
			await screen.getByRole('button', { name: 'CLICK' }).click();
			await new Promise((resolve) => setTimeout(resolve, 2400));
		};
		await play();
		await screen.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();
		await play();
		releaseDelete({});

		await expect.element(screen.getByRole('dialog', { name: /ολοκληρώθηκε/ })).toBeInTheDocument();
		await vi.waitFor(() => expect(order).toEqual(['saved', 'deleted', 'saved']));
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
	});

	// Away and back before the save returns: the lesson is on screen again, but the
	// result overlay is gone, so a countdown started now would run unseen.
	test('leaving and coming back during the save starts no hidden countdown', async () => {
		let release!: (value: unknown) => void;
		const pending = new Promise((resolve) => (release = resolve));
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				await pending;
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickFirst, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await new Promise((resolve) => setTimeout(resolve, 2400));
		await screen.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
		await screen.getByRole('button', { name: 'Προηγούμενο', exact: true }).click();
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();

		release({});
		await new Promise((resolve) => setTimeout(resolve, 6500));
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
	});

	test('does not credit or auto-advance the lesson the learner moved to', async () => {
		let release!: (value: unknown) => void;
		const pending = new Promise((resolve) => (release = resolve));
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				await pending;
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);

		const screen = render(
			LessonRunner as never,
			{ lessons: clickFirst, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);

		await screen.getByRole('button', { name: 'CLICK' }).click();
		// The drill reports its result after ~2s; the save then hangs.
		await new Promise((resolve) => setTimeout(resolve, 2400));

		// The optimistic overlay for the finished lesson is up; the learner moves on
		// from it while the save is still pending.
		await screen.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();

		release({});
		await new Promise((resolve) => setTimeout(resolve, 400));

		// No result overlay over a lesson that was never played…
		await expect
			.element(screen.getByRole('button', { name: /Δοκίμασε ξανά/ }))
			.not.toBeInTheDocument();

		// …and no countdown carrying the learner on to lesson 3.
		await new Promise((resolve) => setTimeout(resolve, 6500));
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
	});
});

describe('the result after a lesson', () => {
	const clickOnly = [
		{
			...mockLessons[1],
			id: 'lesson-click',
			titleKey: 'Μάθημα 1',
			config: { theme: 'default', targetCount: 1, timeLimit: 45 }
		},
		{ ...mockLessons[1], id: 'lesson-2b', titleKey: 'Μάθημα 2' }
	];

	afterEach(() => vi.unstubAllGlobals());

	test('is a named dialog that takes the keyboard with it', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				json: async () => ({ progress: { completed: true, score: 100 } })
			}))
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickOnly, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();

		const dialog = screen.getByRole('dialog', { name: /ολοκληρώθηκε/ });
		await expect.element(dialog).toBeInTheDocument();
		// Focus lands on the next step, and what lies behind cannot be tabbed into.
		await expect.element(screen.getByRole('button', { name: /Επόμενο Μάθημα/ })).toHaveFocus();
		expect(document.querySelector('.lesson-nav')?.closest('[inert]')).not.toBeNull();
	});

	test('a save that cannot reach the server says so, in Greek, and can be retried', async () => {
		let online = false;
		const fetchMock = vi.fn(async () => {
			if (!online) throw new TypeError('Failed to fetch');
			return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
		});
		vi.stubGlobal('fetch', fetchMock);
		const screen = render(
			LessonRunner as never,
			{ lessons: clickOnly, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();

		const alert = screen.getByRole('alert');
		await expect.element(alert).toHaveTextContent(/δεν αποθηκεύτηκε/i);
		// Not presented as a success the server never recorded.
		await expect
			.element(screen.getByRole('dialog', { name: /ολοκληρώθηκε/ }))
			.not.toBeInTheDocument();

		online = true;
		await screen.getByRole('button', { name: /Αποθήκευση ξανά/ }).click();
		await expect.element(screen.getByRole('dialog', { name: /ολοκληρώθηκε/ })).toBeInTheDocument();
		await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});

// No time pressure: a first success used to start "Επόμενο σε 5 δευτερόλεπτα"
// and carry a slow reader off before they had finished reading the result.
test('a success waits for the learner: no countdown, no automatic move', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => ({
			ok: true,
			json: async () => ({ progress: { completed: true, score: 100 } })
		}))
	);
	const lessons = [
		{
			...mockLessons[1],
			id: 'lesson-click',
			titleKey: 'Μάθημα 1',
			config: { theme: 'default', targetCount: 1, timeLimit: 45 }
		},
		{ ...mockLessons[1], id: 'lesson-2b', titleKey: 'Μάθημα 2' }
	];
	const screen = render(
		LessonRunner as never,
		{ lessons, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
	);
	await screen.getByRole('button', { name: 'CLICK' }).click();
	await expect.element(screen.getByRole('dialog', { name: /ολοκληρώθηκε/ })).toBeInTheDocument();
	await expect.element(screen.getByText(/Επόμενο σε/)).not.toBeInTheDocument();

	await new Promise((resolve) => setTimeout(resolve, 6500));
	await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
	await expect.element(screen.getByRole('dialog', { name: /ολοκληρώθηκε/ })).toBeInTheDocument();
	vi.unstubAllGlobals();
});

// Fullscreen used to hide Previous/Next, leaving a beginner inside a lesson with
// no familiar way on. And arriving already in fullscreen was not noticed at all.
test('in fullscreen the lesson can still be moved through', async () => {
	Object.defineProperty(document, 'fullscreenElement', {
		configurable: true,
		get: () => document.body
	});
	try {
		const screen = mount();
		await expect
			.element(screen.getByRole('button', { name: /Έξοδος πλήρους οθόνης/ }))
			.toBeInTheDocument();
		await expect.element(screen.getByRole('button', { name: /Επόμενο/ })).toBeVisible();
		await screen.getByRole('button', { name: /Επόμενο/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
	} finally {
		delete (document as unknown as Record<string, unknown>).fullscreenElement;
	}
});

describe('failed saves and the result dialog, reviewed', () => {
	const twoClicks = [
		{
			...mockLessons[1],
			id: 'lesson-click',
			titleKey: 'Μάθημα 1',
			config: { theme: 'default', targetCount: 1, timeLimit: 45 }
		},
		{
			...mockLessons[1],
			id: 'lesson-click-2',
			lessonKey: 'click-two',
			titleKey: 'Μάθημα 2',
			config: { theme: 'default', targetCount: 1, timeLimit: 45 }
		}
	];
	afterEach(() => vi.unstubAllGlobals());

	// Two lessons failing to save, the first one late: each keeps its own retry.
	test('a late failure of one lesson does not hide the failure of another', async () => {
		let failFirst!: () => void;
		const firstGate = new Promise<void>((resolve) => (failFirst = resolve));
		let online = false;
		vi.stubGlobal(
			'fetch',
			vi.fn(async (_url: string, init: { body: string }) => {
				const { lessonId } = JSON.parse(init.body);
				if (lessonId === 'lesson-click' && !online) await firstGate;
				if (!online) throw new TypeError('Failed to fetch');
				return { ok: true, json: async () => ({ progress: { completed: true, score: 100 } }) };
			})
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: twoClicks, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
		await screen.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await expect.element(screen.getByRole('alert')).toHaveTextContent(/δεν αποθηκεύτηκε/);

		failFirst(); // lesson 1's save now fails, late
		await new Promise((resolve) => setTimeout(resolve, 300));
		await expect.element(screen.getByRole('alert')).toHaveTextContent(/δεν αποθηκεύτηκε/);

		await screen.getByRole('button', { name: 'Προηγούμενο', exact: true }).click();
		await expect.element(title(screen, 'Μάθημα 1')).toBeInTheDocument();
		await expect.element(screen.getByRole('alert')).toHaveTextContent(/δεν αποθηκεύτηκε/);
		online = true;
		await screen.getByRole('button', { name: /Αποθήκευση ξανά/ }).click();
		await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
	});

	test('Tab stays inside the result, even with the fullscreen hint showing', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				json: async () => ({ progress: { completed: true, score: 100 } })
			}))
		);
		const screen = render(
			LessonRunner as never,
			{ lessons: twoClicks, progress: {}, startIndex: 0, moduleId: 'module-1' } as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		const dialog = screen.getByRole('dialog');
		await expect.element(dialog).toBeInTheDocument();
		expect(document.querySelector('.lesson-notices')?.closest('[inert]')).not.toBeNull();

		const { userEvent } = await import('vitest/browser');
		for (let i = 0; i < 6; i++) {
			await userEvent.keyboard(i % 2 ? '{Shift>}{Tab}{/Shift}' : '{Tab}');
			expect(dialog.element().contains(document.activeElement)).toBe(true);
		}
		for (let i = 0; i < 4; i++) {
			await userEvent.keyboard('{Tab}');
			expect(dialog.element().contains(document.activeElement)).toBe(true);
		}
	});
});

// The lesson takes the whole screen; title, instruction and the way to other
// lessons live in a bar over its top edge that gets out of the way once the
// learner starts, and comes back when they reach for it or get stuck.
describe('the bar over the lesson', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({ ok: true, json: async () => ({ progress: { completed: true } }) }))
		);
	});
	afterEach(() => vi.unstubAllGlobals());

	// A hidden bar is inert, so role queries do not find its buttons at all: out
	// of the way for the mouse, the keyboard and a screen reader alike.
	const next = (screen: Screen) => screen.getByRole('button', { name: 'Επόμενο', exact: true });
	const menu = (screen: Screen) => screen.getByRole('button', { name: /Μενού μαθήματος/ });
	const stage = () => document.querySelector('.lesson-card') as HTMLElement;
	const press = (el: Element, init: PointerEventInit = {}) =>
		el.dispatchEvent(
			new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse', ...init })
		);

	test('is open when a lesson starts, so the learner sees what to do', async () => {
		const screen = mount();
		await expect.element(next(screen)).toBeVisible();
		await expect.element(menu(screen)).not.toBeInTheDocument();
	});

	// Laid over the lesson it hid whatever sat at the top, and a learner pressing
	// there pressed the bar instead.
	test('on arrival it sits above the lesson, covering none of it', async () => {
		mount();
		await vi.waitFor(() => expect(document.querySelector('.lesson-bar.open')).not.toBeNull());
		const bar = document.querySelector('.lesson-bar')!.getBoundingClientRect();
		const lesson = stage().getBoundingClientRect();
		expect(lesson.top).toBeGreaterThanOrEqual(bar.bottom - 1);
	});

	test('gets out of the way once the learner starts, leaving a Menu button', async () => {
		const screen = mount();
		await expect.element(next(screen)).toBeVisible();
		press(stage());
		await expect.element(menu(screen)).toBeVisible();
		await expect.element(next(screen)).not.toBeInTheDocument();
	});

	test('the Menu button brings it back, and it can be hidden again', async () => {
		const screen = mount();
		press(stage());
		await menu(screen).click();
		await expect.element(next(screen)).toBeVisible();
		await screen.getByRole('button', { name: /Απόκρυψη/ }).click();
		await expect.element(next(screen)).not.toBeInTheDocument();
		await expect.element(menu(screen)).toBeVisible();
	});

	test('moving the mouse to the top of the screen shows it', async () => {
		const screen = mount();
		press(stage());
		await expect.element(next(screen)).not.toBeInTheDocument();
		window.dispatchEvent(
			new PointerEvent('pointermove', { clientX: 300, clientY: 2, pointerType: 'mouse' })
		);
		await expect.element(next(screen)).toBeVisible();
	});

	test('scrolling up over the lesson shows it when there is nothing to scroll', async () => {
		const screen = mount();
		press(stage());
		await expect.element(next(screen)).not.toBeInTheDocument();
		stage().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: -120 }));
		await expect.element(next(screen)).toBeVisible();
	});

	test('a hidden bar is out of the keyboard and screen reader path', async () => {
		const screen = mount();
		press(stage());
		await expect.element(menu(screen)).toBeVisible();
		expect(document.querySelector('.lesson-bar')?.closest('[inert]')).not.toBeNull();
	});

	test('moving to another lesson opens it again with the new title', async () => {
		const screen = mount();
		await next(screen).click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
		await expect.element(next(screen)).toBeVisible();
	});

	describe('a learner who is stuck', () => {
		const stuckLessons = [
			{
				...mockLessons[0],
				descriptionKey: 'Περάστε το ποντίκι πάνω από τα μπαλόνια',
				config: { ...mockLessons[0].config, stuckAfterSeconds: 0.4 }
			},
			mockLessons[1]
		];

		test('is asked "Κόλλησες;" with help, a way out, and how to find the bar', async () => {
			const onExit = vi.fn();
			const screen = mount({ lessons: stuckLessons, onExit });
			press(stage());
			await expect.element(next(screen)).not.toBeInTheDocument();

			const banner = screen.getByRole('status').filter({ hasText: 'Κόλλησες;' });
			await expect.element(banner).toBeVisible();
			await expect.element(next(screen)).toBeVisible();
			await expect.element(banner.getByText(/πάνω μέρος της οθόνης/)).toBeVisible();

			await banner.getByRole('button', { name: 'Βοήθεια' }).click();
			await expect
				.element(screen.getByText('Περάστε το ποντίκι πάνω από τα μπαλόνια').last())
				.toBeVisible();

			await banner.getByRole('button', { name: 'Έξοδος' }).click();
			expect(onExit).toHaveBeenCalledOnce();
		});

		test('can say "Συνεχίζω" and carry on', async () => {
			const screen = mount({ lessons: stuckLessons });
			const banner = screen.getByRole('status').filter({ hasText: 'Κόλλησες;' });
			await expect.element(banner).toBeVisible();
			await banner.getByRole('button', { name: 'Συνεχίζω' }).click();
			await expect.element(banner).not.toBeInTheDocument();
			await expect.element(menu(screen)).toBeVisible();
		});

		test('is not asked after finishing, even when the save failed', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn(async () => ({ ok: false, json: async () => ({}) }))
			);
			const screen = mount({
				lessons: [
					{
						...mockLessons[0],
						id: 'click-done',
						lessonType: 'click',
						config: { theme: 'default', targetCount: 1, stuckAfterSeconds: 3 }
					},
					mockLessons[1]
				]
			});
			await screen.getByRole('button', { name: 'CLICK' }).click();
			await expect.element(screen.getByRole('alert')).toBeInTheDocument();
			await new Promise((resolve) => setTimeout(resolve, 3500));
			await expect.element(screen.getByText('Κόλλησες;')).not.toBeInTheDocument();
		});

		test('is not asked before the lesson time is up', async () => {
			const screen = mount();
			press(stage());
			await new Promise((resolve) => setTimeout(resolve, 800));
			await expect.element(screen.getByText('Κόλλησες;')).not.toBeInTheDocument();
		});
	});
});

describe('after a completion, Next goes to the next unfinished lesson', () => {
	const three = [
		{
			...mockLessons[1],
			id: 'l-click',
			titleKey: 'Μάθημα 1',
			config: { theme: 'default', targetCount: 1, timeLimit: 45 }
		},
		{ ...mockLessons[1], id: 'l-known', titleKey: 'Μάθημα 2' },
		{ ...mockLessons[1], id: 'l-open', titleKey: 'Μάθημα 3' }
	];

	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				json: async () => ({ progress: { completed: true, score: 100 } })
			}))
		);
	});
	afterEach(() => vi.unstubAllGlobals());

	test('skips a lesson the learner already has', async () => {
		const screen = render(
			LessonRunner as never,
			{
				lessons: three,
				progress: { 'l-known': { completed: true, source: 'guide' } },
				startIndex: 0,
				moduleId: 'module-1'
			} as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await screen.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();
		await expect.element(title(screen, 'Μάθημα 3')).toBeInTheDocument();
	});

	test('offers the next module when everything after is done', async () => {
		const screen = render(
			LessonRunner as never,
			{
				lessons: three,
				progress: { 'l-known': { completed: true }, 'l-open': { completed: true } },
				startIndex: 0,
				moduleId: 'module-1',
				nextModuleId: 'module-2'
			} as never
		);
		await screen.getByRole('button', { name: 'CLICK' }).click();
		await expect
			.element(screen.getByRole('button', { name: /Επόμενη Ενότητα/ }).last())
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole('button', { name: /Επόμενο Μάθημα/ }))
			.not.toBeInTheDocument();
	});

	test('the navigation bar still steps one lesson at a time', async () => {
		const screen = render(
			LessonRunner as never,
			{
				lessons: three,
				progress: { 'l-known': { completed: true } },
				startIndex: 0,
				moduleId: 'module-1'
			} as never
		);
		await screen
			.getByRole('button', { name: /Επόμενο/ })
			.first()
			.click();
		await expect.element(title(screen, 'Μάθημα 2')).toBeInTheDocument();
	});
});
