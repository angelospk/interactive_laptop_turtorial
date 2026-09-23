import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

vi.mock('svelte-sonner', () => ({
	toast: { error: vi.fn(), success: vi.fn() },
	Toaster: () => null
}));

import ClickLesson from './ClickLesson.svelte';
import DoubleClickLesson from './DoubleClickLesson.svelte';
import HoverLesson from './HoverLesson.svelte';
import RightClickLesson from './RightClickLesson.svelte';
import ScrollLesson from './ScrollLesson.svelte';

// Two things confused the learners this is built for: a lesson that would not
// start until they found a button, and a clock that could fail them for being
// slow. Both are gone. `timeLimit` stays in the config contract — 218 seeded
// lessons carry it — but it no longer gates, scores or ends anything.

const lesson = (lessonType: string, config: Record<string, unknown>) =>
	({
		id: `test-${lessonType}`,
		moduleId: 'module1',
		lessonType,
		titleKey: 'module1_lesson1_title',
		descriptionKey: '',
		difficulty: 'beginner',
		config
	}) as never;

const cases = [
	{
		name: 'ClickLesson',
		component: ClickLesson,
		lesson: lesson('click', { targetCount: 3, timeLimit: 45, theme: 'default' })
	},
	{
		name: 'DoubleClickLesson',
		component: DoubleClickLesson,
		lesson: lesson('double-click', { targetCount: 3, timeLimit: 40, theme: 'chests' })
	},
	{
		name: 'HoverLesson',
		component: HoverLesson,
		lesson: lesson('hover', { targetCount: 3, timeLimit: 30, theme: 'balloons' })
	},
	{
		name: 'RightClickLesson',
		component: RightClickLesson,
		lesson: lesson('right-click', { targetCount: 3, timeLimit: 50, theme: 'mystery' })
	},
	{
		name: 'ScrollLesson',
		component: ScrollLesson,
		lesson: lesson('scroll', { timeLimit: 40, theme: 'adventure', scrollTarget: 500 })
	}
];

describe.each(cases)('$name has no start gate and no clock', ({ component, lesson: l }) => {
	it('is playable the moment it opens', async () => {
		const screen = render(
			component as never,
			{
				lesson: l,
				onComplete: vi.fn(),
				onBack: vi.fn()
			} as never
		);

		await expect
			.element(screen.getByRole('button', { name: /Έναρξη|Start/ }))
			.not.toBeInTheDocument();
	});

	it('never shows a countdown', async () => {
		const screen = render(
			component as never,
			{
				lesson: l,
				onComplete: vi.fn(),
				onBack: vi.fn()
			} as never
		);

		await expect.element(screen.getByText(/Χρόνος|ΧΡΟΝΟΣ/)).not.toBeInTheDocument();
	});
});

// A drill reports its result 2 seconds after the last target, so the learner can
// see "Ολοκληρώθηκε". Pressing Επόμενο inside that window used to leave the
// timer running: it fired from a destroyed component into the runner, which read
// the lesson the learner had *moved to* and marked that one complete — the same
// family of bug as the transition jumps.
describe('a finished drill does not report into the next lesson', () => {
	it('stays silent when the learner leaves before the result lands', async () => {
		const onComplete = vi.fn();
		const screen = render(
			ClickLesson as never,
			{
				lesson: lesson('click', { targetCount: 1, timeLimit: 45, theme: 'default' }),
				onComplete,
				onBack: vi.fn()
			} as never
		);

		await screen.getByRole('button', { name: 'CLICK' }).click();
		screen.unmount();

		await new Promise((resolve) => setTimeout(resolve, 2600));
		expect(onComplete).not.toHaveBeenCalled();
	});
});

// The HUD deducts 10 points for a wrong click. Recomputing the final score from
// the target count alone threw that away and submitted 100 either way, so the
// deduction the learner watched happen meant nothing.
describe('a wrong click still costs something at the end', () => {
	it('submits the score the learner watched, penalty included', async () => {
		const onComplete = vi.fn();
		vi.spyOn(Math, 'random').mockReturnValue(0.5); // mixedType → 'double-click'
		const screen = render(
			ClickLesson as never,
			{
				lesson: lesson('click', { targetCount: 1, timeLimit: 45, theme: 'mixed' }),
				onComplete,
				onBack: vi.fn()
			} as never
		);

		const target = screen.getByRole('button', { name: '2x CLICK' });
		await target.click(); // wrong pattern, costs points
		// Let it stand as a single click: straight after it, the next two clicks
		// would join it into one (triple) double-click.
		await new Promise((resolve) => setTimeout(resolve, 800));
		await target.dblClick(); // completes it
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 4000 });

		// Whatever the penalties added up to, the submitted number is the one the
		// learner was shown — not a clean 100.
		const submitted = onComplete.mock.calls[0][0] as number;
		expect(submitted).toBeLessThan(100);
		await expect.element(screen.getByText(new RegExp(`:\\s*${submitted}\\b`))).toBeInTheDocument();
		vi.restoreAllMocks();
	});
});
