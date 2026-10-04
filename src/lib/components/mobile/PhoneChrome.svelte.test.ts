import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import MobileFrame from './MobileFrame.svelte';
import QuickSettingsPanel from './QuickSettingsPanel.svelte';
import MobileSettingsApp from './apps/MobileSettingsApp.svelte';
import PhoneApp from './apps/PhoneApp.svelte';
import MessagingApp from './apps/MessagingApp.svelte';
import MobileSimLesson from '$lib/components/lessons/interactive/MobileSimLesson.svelte';
import { PhoneState } from './phoneState.svelte';

const content = createRawSnippet(() => ({ render: () => `<p>οθόνη</p>` }));

describe('PhoneState is the single owner of the phone', () => {
	it('the status bar follows Wi-Fi / airplane / torch and the screen dims', async () => {
		const phone = new PhoneState();
		const screen = render(MobileFrame, { children: content, phone });
		const icons = () => screen.container.querySelector('[data-testid="mobile-status-icons"]')!;
		expect(icons().querySelector('[data-status="wifi"]')).not.toBeNull();

		phone.toggleTile('wifi');
		await vi.waitFor(() => expect(icons().querySelector('[data-status="wifi"]')).toBeNull());

		phone.toggleTile('torch');
		await vi.waitFor(() => expect(icons().querySelector('[data-status="torch"]')).not.toBeNull());

		phone.toggleTile('airplane');
		await vi.waitFor(() =>
			expect(icons().querySelector('[data-status="airplane"]')).not.toBeNull()
		);

		expect(screen.container.querySelector('[data-brightness-dim]')).toBeNull();
		phone.brightness = 40;
		await vi.waitFor(() =>
			expect(screen.container.querySelector('[data-brightness-dim]')).not.toBeNull()
		);
	});

	it('a tile toggled in quick settings is what Settings shows afterwards', async () => {
		const phone = new PhoneState();
		const onToggle = vi.fn();
		const qs = render(QuickSettingsPanel, { phone, onToggle, onClose: vi.fn() });
		await qs.getByRole('switch', { name: 'Wi-Fi' }).click();
		expect(onToggle).toHaveBeenCalledWith('wifi', false);
		expect(phone.wifiOn).toBe(false);

		const settings = render(MobileSettingsApp, {
			onEvent: vi.fn(),
			phone,
			wifiNetworks: ['SPITI']
		});
		await settings.getByRole('button', { name: 'Wi-Fi' }).click();
		await expect
			.element(settings.getByRole('switch', { name: 'Wi-Fi ενεργό' }))
			.toHaveAttribute('aria-checked', 'false');
		await expect.element(settings.getByText(/Το Wi-Fi είναι κλειστό/)).toBeInTheDocument();
	});

	it('airplane mode switches Wi-Fi off; the quick-toggle event still names the tile', async () => {
		const phone = new PhoneState();
		const onToggle = vi.fn();
		const qs = render(QuickSettingsPanel, { phone, onToggle, onClose: vi.fn() });
		await qs.getByRole('switch', { name: 'Λειτουργία πτήσης' }).click();
		expect(onToggle).toHaveBeenCalledWith('airplane', true);
		expect(phone.wifiOn).toBe(false);
		await expect
			.element(qs.getByRole('switch', { name: 'Wi-Fi' }))
			.toHaveAttribute('aria-checked', 'false');
	});

	it('font size chosen in Settings survives leaving and reopening the app', async () => {
		const phone = new PhoneState();
		const onEvent = vi.fn();
		const first = render(MobileSettingsApp, { onEvent, phone });
		await first.getByRole('button', { name: 'Μέγεθος γραμμάτων' }).click();
		await first.getByRole('button', { name: 'Μεγάλα' }).click();
		expect(onEvent).toHaveBeenCalledWith('mobile-font-size-set', { size: 'large' });
		first.unmount();

		const again = render(MobileSettingsApp, { onEvent: vi.fn(), phone });
		await expect
			.element(again.getByRole('button', { name: 'Μέγεθος γραμμάτων' }))
			.toHaveTextContent(/Μεγάλα/);
	});
});

describe('iPhone chrome', () => {
	it('renders Control Center with the same tile events', async () => {
		const phone = new PhoneState();
		const onToggle = vi.fn();
		const qs = render(QuickSettingsPanel, { variant: 'ios', phone, onToggle, onClose: vi.fn() });
		await expect.element(qs.getByRole('dialog', { name: 'Κέντρο ελέγχου' })).toBeInTheDocument();
		await qs.getByRole('switch', { name: 'Φακός' }).click();
		expect(onToggle).toHaveBeenCalledWith('torch', true);
		expect(phone.torchOn).toBe(true);
	});

	it('the iPhone status bar is the Control Center handle and completes the torch lesson', async () => {
		const onComplete = vi.fn();
		const lesson = {
			id: 'ios-torch',
			moduleId: 'iphone',
			lessonType: 'mobile-sim',
			config: {
				goal: 'mobile-quick-toggle',
				variant: 'ios',
				prompt: 'Άναψε τον φακό.',
				apps: [{ id: 'phone', label: 'Τηλέφωνο', icon: '📞', kind: 'phone' }],
				targetTile: 'torch',
				successMessage: 'Μπράβο! Ο φακός άναψε.'
			}
		} as never;
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Κέντρο ελέγχου' }).click();
		await screen.getByRole('switch', { name: 'Φακός' }).click();
		await expect.element(screen.getByText('Μπράβο! Ο φακός άναψε.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('SMS on iPhone uses green bubbles and the iOS Phone app has a bottom tab bar', async () => {
		const msg = render(MessagingApp, {
			variant: 'ios',
			onEvent: vi.fn(),
			conversations: [{ id: 'e', name: 'Ελένη', messages: [{ from: 'them', text: 'Γεια' }] }]
		});
		await msg.getByRole('button', { name: 'Συνομιλία με Ελένη' }).click();
		await msg.getByRole('textbox', { name: 'Γράψε μήνυμα' }).fill('Καλημέρα');
		await msg.getByRole('button', { name: 'Αποστολή' }).click();
		const bubble = msg.getByText('Καλημέρα', { exact: true });
		await expect.element(bubble).toHaveClass(/bg-\[#34c759\]/);
		await expect.element(msg.getByText('Παραδόθηκε')).toBeInTheDocument();

		const phone = render(PhoneApp, {
			variant: 'ios',
			onEvent: vi.fn(),
			contacts: [{ id: 'e', name: 'Ελένη', number: '697 111 2233' }]
		});
		await expect.element(phone.getByRole('button', { name: 'Αγαπημένα' })).toBeInTheDocument();
		await expect.element(phone.getByRole('button', { name: 'Πρόσφατα' })).toBeInTheDocument();
	});
});

describe('Phone app call flow', () => {
	it('placing a call shows the in-call screen and hanging up returns to the keypad', async () => {
		const onEvent = vi.fn();
		const screen = render(PhoneApp, { onEvent });
		await screen.getByRole('button', { name: 'Ψηφίο 2' }).click();
		await screen.getByRole('button', { name: 'Ψηφίο 1' }).click();
		await screen.getByRole('button', { name: 'Ψηφίο 0' }).click();
		await screen.getByRole('button', { name: 'Κλήση' }).click();
		expect(onEvent).toHaveBeenCalledWith('mobile-call-placed', { number: '210' });
		await expect
			.element(screen.getByRole('button', { name: 'Τερματισμός κλήσης' }))
			.toBeInTheDocument();
		await screen.getByRole('button', { name: 'Τερματισμός κλήσης' }).click();
		await expect.element(screen.getByRole('button', { name: 'Κλήση' })).toBeInTheDocument();
		// Exactly one call event for the whole gesture.
		expect(onEvent.mock.calls.filter(([a]) => a === 'mobile-call-placed')).toHaveLength(1);
	});
});
