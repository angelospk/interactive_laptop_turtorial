import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InstructionText from './InstructionText.svelte';

describe('InstructionText', () => {
	it('shows numbered steps as a numbered list', async () => {
		const screen = render(InstructionText, {
			text: 'Αλλάξτε το όνομα:\n1. Κάντε δεξί κλικ.\n2. Επιλέξτε «Μετονομασία».'
		});
		await expect.element(screen.getByText('Αλλάξτε το όνομα:')).toBeVisible();
		const items = screen.getByRole('listitem');
		expect(items.elements()).toHaveLength(2);
		await expect.element(items.nth(1)).toHaveTextContent('Επιλέξτε «Μετονομασία».');
		expect(screen.container.querySelector('ol')).not.toBeNull();
	});

	it('shows plain text without a list', async () => {
		const screen = render(InstructionText, { text: 'Ανοίξτε το Excel.' });
		await expect.element(screen.getByText('Ανοίξτε το Excel.')).toBeVisible();
		expect(screen.container.querySelector('ol')).toBeNull();
	});
});
