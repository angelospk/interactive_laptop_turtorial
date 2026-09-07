import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LessonRunner from './LessonRunner.svelte';

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

	test('Previous is disabled on the first lesson', async () => {
		const screen = mount();
		await expect.element(screen.getByRole('button', { name: /Προηγούμενο/ })).toBeDisabled();
	});
});
