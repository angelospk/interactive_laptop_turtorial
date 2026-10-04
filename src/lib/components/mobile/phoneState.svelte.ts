/**
 * The simulated phone's state, owned by the lesson host (MobileSimLesson
 * creates one per lesson) and shared by the frame (status bar icons, dim
 * layer), the quick-settings / Control Center panel and the Settings app. One
 * owner means a toggle survives closing the panel or switching apps, and the
 * status bar always tells the truth about Wi-Fi / airplane mode / brightness.
 */
export type PhoneFontSize = 'small' | 'medium' | 'large';

export class PhoneState {
	wifiOn = $state(true);
	connectedSsid = $state<string | null>(null);
	bluetoothOn = $state(false);
	torchOn = $state(false);
	airplaneMode = $state(false);
	rotationLock = $state(true);
	batterySaver = $state(false);
	doNotDisturb = $state(false);
	brightness = $state(100);
	volume = $state(70);
	fontSize = $state<PhoneFontSize>('medium');
	nightMode = $state(false);
	findDevice = $state(false);
	/** Display only; never drains during a lesson. */
	readonly batteryPercent = 82;

	setWifi(on: boolean) {
		this.wifiOn = on;
		if (!on) this.connectedSsid = null;
	}

	setAirplane(on: boolean) {
		this.airplaneMode = on;
		if (on) {
			this.setWifi(false);
			this.bluetoothOn = false;
		}
	}

	connect(ssid: string) {
		if (!this.wifiOn) this.wifiOn = true;
		this.connectedSsid = ssid;
	}

	/** Quick-settings tiles by id; returns the new value. */
	toggleTile(id: string): boolean {
		switch (id) {
			case 'wifi':
				this.setWifi(!this.wifiOn);
				return this.wifiOn;
			case 'bluetooth':
				this.bluetoothOn = !this.bluetoothOn;
				return this.bluetoothOn;
			case 'torch':
				this.torchOn = !this.torchOn;
				return this.torchOn;
			case 'airplane':
				this.setAirplane(!this.airplaneMode);
				return this.airplaneMode;
			case 'rotation':
				this.rotationLock = !this.rotationLock;
				return this.rotationLock;
			case 'saver':
				this.batterySaver = !this.batterySaver;
				return this.batterySaver;
			case 'dnd':
				this.doNotDisturb = !this.doNotDisturb;
				return this.doNotDisturb;
			default:
				return false;
		}
	}
}
