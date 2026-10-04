import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VideoCallApp from './VideoCallApp.svelte';

describe('VideoCallApp meeting code', () => {
	it('joins a scheduled meeting with the code from the invitation', async () => {
		const onAction = vi.fn();
		const screen = render(VideoCallApp, {
			config: { meetingCode: '845 220 193' },
			onAction
		} as never);
		await screen.getByLabelText('Κωδικός σύσκεψης').fill('845220193');
		await screen.getByRole('button', { name: 'Συμμετοχή' }).click();
		expect(onAction).toHaveBeenCalledWith('join-meeting', { code: '845220193' });
		await expect.element(screen.getByText('Είστε στη σύσκεψη')).toBeInTheDocument();
	});

	it('reports a wrong code without entering the meeting', async () => {
		const onAction = vi.fn();
		const screen = render(VideoCallApp, {
			config: { meetingCode: '845 220 193' },
			onAction
		} as never);
		await screen.getByLabelText('Κωδικός σύσκεψης').fill('111');
		await screen.getByRole('button', { name: 'Συμμετοχή' }).click();
		expect(onAction).toHaveBeenCalledWith('join-meeting', { code: '111' });
		await expect.element(screen.getByText('Ο κωδικός δεν είναι σωστός')).toBeInTheDocument();
	});

	it('keeps the plain call screen when no meeting is configured', async () => {
		const screen = render(VideoCallApp, { config: {}, onAction: vi.fn() } as never);
		await expect.element(screen.getByTitle('Έναρξη κλήσης')).toBeInTheDocument();
		expect(screen.container.querySelector('input')).toBeNull();
	});
});
