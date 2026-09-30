import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from '@vitest/browser/context';
import FileExplorerApp from './FileExplorerApp.svelte';

/**
 * File tiles only reacted to the mouse, so a keyboard learner could never
 * finish "select a file" or open a folder in the file-management lessons.
 */
describe('FileExplorerApp keyboard', () => {
	it('selects a file with Enter', async () => {
		const onAction = vi.fn();
		const screen = render(FileExplorerApp, { onAction });
		const tile = screen.getByRole('button', { name: /Λίστα Ψώνια\.txt/ });
		(tile.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction).toHaveBeenCalledWith('select-file', { id: '3' });
	});

	it('selects a folder with Space without opening it', async () => {
		const onAction = vi.fn();
		const screen = render(FileExplorerApp, { onAction });
		(screen.getByRole('button', { name: /^Έγγραφα/ }).element() as HTMLElement).focus();
		await userEvent.keyboard(' ');
		expect(onAction).toHaveBeenCalledWith('select-file', { id: '1' });
		await expect.element(screen.getByText('Συνταγή Κέικ.txt')).not.toBeInTheDocument();
	});

	it('opens a folder with Enter', async () => {
		const screen = render(FileExplorerApp, { onAction: vi.fn() });
		(screen.getByRole('button', { name: /^Έγγραφα/ }).element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(screen.getByText('Συνταγή Κέικ.txt')).toBeVisible();
	});
});
