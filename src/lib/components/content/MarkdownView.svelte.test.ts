import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
vi.mock('$env/dynamic/public', () => ({ env: {} }));

import '../../../routes/layout.css';
import MarkdownView from './MarkdownView.svelte';

// A drawn picture, so the test needs no network.
const PIXEL =
	'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22teal%22/%3E%3C/svg%3E';

function serve(markdown: string) {
	vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(markdown));
}

afterEach(() => vi.restoreAllMocks());

describe('MarkdownView — image lightbox', () => {
	async function openImage() {
		serve(`# Θεωρία\n\n<img alt="Η οθόνη του Gmail" src="${PIXEL}" width="400" height="300">`);
		const screen = render(MarkdownView, { mdPath: 'md/test.md' });
		await screen.getByRole('img', { name: 'Η οθόνη του Gmail' }).click();
		const dialog = screen.getByRole('dialog');
		await expect.element(dialog).toBeVisible();
		return { screen, dialog };
	}

	it('shows the clicked image full screen with a large close button', async () => {
		const { dialog } = await openImage();
		await expect
			.element(dialog.getByRole('img', { name: 'Η οθόνη του Gmail' }))
			.toHaveAttribute('src', PIXEL);
		const close = dialog.getByRole('button', { name: 'Κλείσιμο' });
		await expect.element(close).toHaveFocus();
		const box = close.element().getBoundingClientRect();
		expect(box.width).toBeGreaterThanOrEqual(56);
	});

	it('closes with the X', async () => {
		const { screen, dialog } = await openImage();
		await dialog.getByRole('button', { name: 'Κλείσιμο' }).click();
		await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('closes with Escape', async () => {
		const { screen } = await openImage();
		await userEvent.keyboard('{Escape}');
		await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('closes on a click outside the image, not on the image', async () => {
		const { screen, dialog } = await openImage();
		await dialog.getByRole('img').click();
		await expect.element(screen.getByRole('dialog')).toBeVisible();
		await dialog.click({ position: { x: 5, y: 5 } });
		await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
	});
});
