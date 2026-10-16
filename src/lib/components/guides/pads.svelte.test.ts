import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import MousePad from './MousePad.svelte';
import KeyboardPad from './KeyboardPad.svelte';

// The two small demos the module1 and module2 guides walk through. Each reports
// what the learner did, so a practical step can move on by itself.

const types = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.map(([e]) => e.type);
const el = (guide: string) => document.querySelector(`[data-guide="${guide}"]`) as HTMLElement;

describe('MousePad', () => {
	it('has a spot for each mouse skill', () => {
		render(MousePad, { onEvent: vi.fn() });
		for (const g of ['hover', 'click', 'double-click', 'right-click', 'drag']) {
			expect(el(g), g).not.toBeNull();
		}
	});

	it('reports hover, click, double click and right click', async () => {
		const onEvent = vi.fn();
		render(MousePad, { onEvent });
		await userEvent.hover(el('hover'));
		await userEvent.click(el('click').querySelector('button')!);
		await userEvent.dblClick(el('double-click').querySelector('button')!);
		await userEvent.click(el('right-click').querySelector('button')!, { button: 'right' });
		expect(types(onEvent)).toEqual(
			expect.arrayContaining(['pad-hover', 'pad-click', 'pad-double-click', 'pad-right-click'])
		);
	});

	it('reports a file dropped in the bin, every time: an early try never uses it up', async () => {
		const onEvent = vi.fn();
		render(MousePad, { onEvent });
		const file = () => el('drag').querySelector('[data-testid="drag-file"]') as HTMLElement;
		const bin = el('drag').querySelector('[data-testid="drag-bin"]') as HTMLElement;
		await userEvent.dragAndDrop(file(), bin);
		await vi.waitFor(() => expect(types(onEvent)).toContain('pad-drag-drop'));
		await userEvent.dragAndDrop(file(), bin);
		await vi.waitFor(() =>
			expect(types(onEvent).filter((t) => t === 'pad-drag-drop')).toHaveLength(2)
		);
	});
});

describe('KeyboardPad', () => {
	it('reports the click into the box, the text, Enter and an emptied box', async () => {
		const onEvent = vi.fn();
		render(KeyboardPad, { onEvent });
		const box = el('text-box').querySelector('input')!;
		await userEvent.click(box);
		await userEvent.keyboard('καλημέρα');
		await userEvent.keyboard('{Enter}');
		expect(onEvent).toHaveBeenCalledWith({ type: 'pad-focus' });
		expect(onEvent).toHaveBeenCalledWith({ type: 'pad-typed', text: 'καλημέρα' });
		expect(onEvent).toHaveBeenCalledWith({ type: 'pad-enter', text: 'καλημέρα' });
		// Enter sends the line, like a chat: the box is empty again.
		await expect.element(box).toHaveValue('');

		await userEvent.keyboard('αβ');
		await userEvent.keyboard('{Backspace}{Backspace}');
		expect(onEvent).toHaveBeenCalledWith({ type: 'pad-cleared' });
	});

	it('only an emptied box counts as cleared, not one left with spaces', async () => {
		const onEvent = vi.fn();
		render(KeyboardPad, { onEvent });
		await userEvent.click(el('text-box').querySelector('input')!);
		await userEvent.keyboard('α{Backspace}  ');
		expect(types(onEvent).filter((t) => t === 'pad-cleared')).toHaveLength(1);
		onEvent.mockClear();
		await userEvent.keyboard('β');
		await userEvent.keyboard('{Backspace}');
		// «  β» → «  »: not empty, so not cleared.
		expect(types(onEvent)).not.toContain('pad-cleared');
	});

	it('shows the keys the guide talks about', () => {
		render(KeyboardPad, { onEvent: vi.fn() });
		for (const g of ['text-box', 'enter-key', 'shift-key', 'backspace-key', 'tonos-key']) {
			expect(el(g), g).not.toBeNull();
		}
		for (const g of ['language', 'shortcuts', 'at-key']) expect(el(g), g).not.toBeNull();
	});
});
