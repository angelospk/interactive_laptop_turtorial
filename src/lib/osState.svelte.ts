export class OSState {
    wifiEnabled = $state(true);
    connectedNetwork = $state<string | null>(null);
    volume = $state(80);
    brightness = $state(100);
    bluetoothEnabled = $state(false);
    airplaneMode = $state(false);

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
    }

    setBrightness(val: number) {
        this.brightness = val;
    }
}

export const osState = new OSState();
