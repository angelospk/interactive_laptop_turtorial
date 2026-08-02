import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GovLesson from './GovLesson.svelte';
import HealthSimLesson from './HealthSimLesson.svelte';
import ScamSpotterLesson from './ScamSpotterLesson.svelte';
import { govLessons } from '$lib/db/seeds/gov-lessons';
import { healthLessons } from '$lib/db/seeds/health-lessons';
import { scamPerDeviceLessons } from '$lib/db/seeds/scam-perdevice-lessons';
import type { Lesson } from '$lib/db/schema';

/**
 * Render smoke tests for the Φάση-3 service tracks. They mount the ACTUAL seeded
 * lessons through their renderers and assert the prompt shows — proving the
 * components mount without a runtime crash (the one thing unit/parser tests can't
 * catch). Interaction/goal logic is covered by govSim/healthSim/goalHandlers tests.
 */

const firstOfType = (arr: unknown[], type: string) =>
	(arr as Lesson[]).find((l) => l.lessonType === type)!;

describe('GovLesson renders a real seeded gov-simulation lesson', () => {
	it('mounts the gov-login lesson and shows its prompt', async () => {
		const lesson = firstOfType(govLessons, 'gov-simulation');
		const screen = render(GovLesson, { lesson, onComplete: vi.fn(), onBack: vi.fn() });
		const prompt = (lesson.config as { prompt: string }).prompt;
		await expect.element(screen.getByText(prompt)).toBeInTheDocument();
	});
});

describe('HealthSimLesson renders a real seeded health-simulation lesson', () => {
	it('mounts the first health-simulation lesson and shows its prompt', async () => {
		const lesson = firstOfType(healthLessons, 'health-simulation');
		const screen = render(HealthSimLesson, { lesson, onComplete: vi.fn(), onBack: vi.fn() });
		const prompt = (lesson.config as { prompt: string }).prompt;
		await expect.element(screen.getByText(prompt)).toBeInTheDocument();
	});
});

describe('ScamSpotterLesson renders the per-device (DeviceSms) scam lesson', () => {
	it('mounts the per-device scam lesson and shows the first card body', async () => {
		const lesson = scamPerDeviceLessons[0] as Lesson;
		const cards = (lesson.config as { cards: { body: string }[] }).cards;
		const screen = render(ScamSpotterLesson, { lesson, onComplete: vi.fn(), onBack: vi.fn() });
		// The first card's message body renders (exercises the DeviceSms branch when
		// that card carries a deviceVariant).
		await expect.element(screen.getByText(cards[0].body, { exact: false })).toBeInTheDocument();
	});
});
