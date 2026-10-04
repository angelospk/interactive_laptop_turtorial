/**
 * The simulated Mac's machine state, owned by the lesson host (MacSimLesson
 * creates one per lesson) and passed to the menu bar, Control Center, Finder
 * and System Settings. One owner means Wi-Fi switched off in Control Center is
 * off in System Settings too, and a Finder folder stays open when the learner
 * switches apps and comes back — the frontmost-only rendering of MacSimLesson
 * would otherwise lose component-local state.
 */
export type MacSize = 'small' | 'medium' | 'large';
export type MacAppearance = 'light' | 'dark';

export class MacState {
	wifiOn = $state(true);
	connectedSsid = $state<string | null>('SPITI-WIFI');
	bluetoothOn = $state(true);
	airdropOn = $state(false);
	focusOn = $state(false);
	brightness = $state(100);
	volume = $state(60);
	appearance = $state<MacAppearance>('light');
	textSize = $state<MacSize>('medium');
	pointerSize = $state<MacSize>('medium');
	/** Which System Settings pane is selected in the sidebar. */
	settingsSection = $state('accessibility');
	/** Finder: the folder open in the front window (null = nothing picked yet). */
	finderFolderId = $state<string | null>(null);
	finderView = $state<'list' | 'icons'>('list');
	/** Battery is display only; it never drains during a lesson. */
	readonly batteryPercent = 86;

	readonly networks = ['SPITI-WIFI', 'COSMOTE-4G-1234', 'CAFE-KENTRO'];

	setWifi(on: boolean) {
		this.wifiOn = on;
		if (!on) this.connectedSsid = null;
	}

	connect(ssid: string) {
		if (!this.wifiOn) return;
		this.connectedSsid = ssid;
	}
}
