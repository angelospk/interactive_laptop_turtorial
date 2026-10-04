/**
 * Simulated machine state shared by the Windows chrome (taskbar tray, Quick
 * Settings) and the Settings app, so a toggle flipped in one place is visible
 * everywhere else — the tray icon goes grey when Wi-Fi is off, the screen dims
 * with the brightness slider, night light tints it.
 */
export class OSState {
	wifiEnabled = $state(true);
	connectedNetwork = $state<string | null>(null);
	volume = $state(80);
	muted = $state(false);
	brightness = $state(100);
	bluetoothEnabled = $state(false);
	airplaneMode = $state(false);
	nightLight = $state(false);
	batterySaver = $state(false);
	/** Display-only: a laptop battery, far from empty. */
	batteryPercent = $state(74);

	// Mock Data
	availableNetworks = ['Home_WiFi', 'OTE_Network', 'Public_WiFi_Free', 'Coffee_Shop'];

	toggleWifi(value: boolean) {
		this.wifiEnabled = value;
		if (!value) this.connectedNetwork = null;
	}

	connectWifi(ssid: string) {
		if (this.wifiEnabled) {
			this.connectedNetwork = ssid;
		}
	}

	setVolume(val: number) {
		this.volume = val;
		if (val > 0) this.muted = false;
	}

	setBrightness(val: number) {
		this.brightness = val;
	}

	toggleAirplane(value: boolean) {
		this.airplaneMode = value;
		if (value) {
			this.toggleWifi(false);
			this.bluetoothEnabled = false;
		}
	}

	/** Back to the state a lesson starts from (used between lessons/tests). */
	reset() {
		this.wifiEnabled = true;
		this.connectedNetwork = null;
		this.volume = 80;
		this.muted = false;
		this.brightness = 100;
		this.bluetoothEnabled = false;
		this.airplaneMode = false;
		this.nightLight = false;
		this.batterySaver = false;
	}
}

export const osState = new OSState();
