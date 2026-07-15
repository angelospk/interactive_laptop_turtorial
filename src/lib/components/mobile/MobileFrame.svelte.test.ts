import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import MobileFrame from './MobileFrame.svelte';

// A tiny snippet standing in for lesson content rendered inside the frame.
const content = createRawSnippet(() => ({
	render: () => `<p data-testid="lesson-content">Γεια σου κινητό</p>`
}));

describe('MobileFrame', () => {
	it('renders the phone chrome and its children', async () => {
		const screen = render(MobileFrame, { children: content });
		await expect.element(screen.getByTestId('mobile-frame')).toBeInTheDocument();
		await expect.element(screen.getByTestId('mobile-statusbar')).toBeInTheDocument();
		await expect.element(screen.getByTestId('mobile-home-indicator')).toBeInTheDocument();
		await expect.element(screen.getByTestId('lesson-content')).toBeInTheDocument();
	});

	it('defaults to the android variant with an accessible label', async () => {
		const screen = render(MobileFrame, { children: content });
		const frame = screen.getByTestId('mobile-frame');
		await expect.element(frame).toHaveAttribute('data-variant', 'android');
		await expect.element(frame).toHaveAttribute('aria-label', 'Προσομοίωση οθόνης Android');
	});

	it('switches chrome + label for the ios variant', async () => {
		const screen = render(MobileFrame, { children: content, variant: 'ios' });
		const frame = screen.getByTestId('mobile-frame');
		await expect.element(frame).toHaveAttribute('data-variant', 'ios');
		await expect.element(frame).toHaveAttribute('aria-label', 'Προσομοίωση οθόνης iPhone');
	});

	it('shows the provided status-bar time', async () => {
		const screen = render(MobileFrame, { children: content, time: '12:34' });
		await expect.element(screen.getByText('12:34')).toBeInTheDocument();
	});

	describe('system buttons (screenshot chord)', () => {
		it('hides the bezel buttons unless explicitly enabled', async () => {
			const screen = render(MobileFrame, { children: content });
			await expect.element(screen.getByTestId('bezel-power')).not.toBeInTheDocument();
		});

		it('emits the canonical sorted chord when two buttons are pressed together', async () => {
			const onSystemChord = vi.fn();
			const screen = render(MobileFrame, { children: content, showSystemButtons: true, onSystemChord });
			await screen.getByTestId('bezel-power').click();
			await screen.getByTestId('bezel-volume-down').click();
			expect(onSystemChord).toHaveBeenCalledWith('power+volume-down');
		});

		it('is order-independent (volume first, then power → same chord)', async () => {
			const onSystemChord = vi.fn();
			const screen = render(MobileFrame, { children: content, showSystemButtons: true, onSystemChord });
			await screen.getByTestId('bezel-volume-up').click();
			await screen.getByTestId('bezel-power').click();
			expect(onSystemChord).toHaveBeenCalledWith('power+volume-up');
		});

		it('does not fire on a single button press', async () => {
			const onSystemChord = vi.fn();
			const screen = render(MobileFrame, { children: content, showSystemButtons: true, onSystemChord });
			await screen.getByTestId('bezel-power').click();
			expect(onSystemChord).not.toHaveBeenCalled();
		});

		it('does not fire when the same button is pressed twice', async () => {
			const onSystemChord = vi.fn();
			const screen = render(MobileFrame, { children: content, showSystemButtons: true, onSystemChord });
			await screen.getByTestId('bezel-power').click();
			await screen.getByTestId('bezel-power').click();
			expect(onSystemChord).not.toHaveBeenCalled();
		});
	});
});
