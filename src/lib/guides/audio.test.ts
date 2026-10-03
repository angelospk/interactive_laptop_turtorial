import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGuideAudio, readingMs } from './audio';

class FakeAudio {
	static last: FakeAudio;
	onended: (() => void) | null = null;
	onerror: (() => void) | null = null;
	paused = true;
	constructor(public src: string) {
		FakeAudio.last = this;
	}
	play = vi.fn(() => {
		this.paused = false;
		return Promise.resolve();
	});
	pause = vi.fn(() => {
		this.paused = true;
	});
}

const make = (muted = false) =>
	createGuideAudio({
		base: '/a/',
		muted,
		createAudio: (src) => new FakeAudio(src) as unknown as HTMLAudioElement
	});

describe('guide audio', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('gives a caption at least 2.5s, longer captions more', () => {
		expect(readingMs('σύντομο')).toBe(2500);
		expect(readingMs('x'.repeat(100))).toBe(5500);
	});

	it('plays the clip file and reports its end once', () => {
		const onEnd = vi.fn();
		make().play('common.known.1', 'Ωραία!', onEnd);
		expect(FakeAudio.last.src).toBe('/a/common.known.1.mp3');
		FakeAudio.last.onended?.();
		FakeAudio.last.onended?.();
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it('muted: no audio, the end comes after the reading time', () => {
		const onEnd = vi.fn();
		make(true).play('x', 'Ωραία!', onEnd);
		vi.advanceTimersByTime(2499);
		expect(onEnd).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it('a missing file falls back to the reading time, silently', () => {
		const onEnd = vi.fn();
		make().play('x', 'Ωραία!', onEnd);
		FakeAudio.last.onerror?.();
		vi.advanceTimersByTime(2500);
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it('a blocked play() falls back too', async () => {
		const onEnd = vi.fn();
		const audio = createGuideAudio({
			base: '/a/',
			muted: false,
			createAudio: (src) => {
				const a = new FakeAudio(src);
				a.play = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
				return a as unknown as HTMLAudioElement;
			}
		});
		audio.play('x', 'Ωραία!', onEnd);
		await vi.advanceTimersByTimeAsync(2500);
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it('a newer clip or stop() silences the old one and drops its end', () => {
		const onEnd = vi.fn();
		const audio = make();
		audio.play('a', 'x', onEnd);
		const first = FakeAudio.last;
		audio.play('b', 'y', vi.fn());
		expect(first.pause).toHaveBeenCalled();
		first.onended?.();
		audio.stop();
		expect(FakeAudio.last.pause).toHaveBeenCalled();
		expect(onEnd).not.toHaveBeenCalled();
	});

	it('muting mid-clip stops the sound but still ends the clip', () => {
		const onEnd = vi.fn();
		const audio = make();
		audio.play('a', 'Ωραία!', onEnd);
		audio.setMuted(true);
		expect(FakeAudio.last.pause).toHaveBeenCalled();
		vi.advanceTimersByTime(2500);
		expect(onEnd).toHaveBeenCalledTimes(1);
	});
});

describe('guide audio that never finishes', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('a clip that neither ends nor fails still ends, after twice its reading time', () => {
		const onEnd = vi.fn();
		make().play('x', 'Ωραία!', onEnd);
		vi.advanceTimersByTime(2 * 2500 + 4999);
		expect(onEnd).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(onEnd).toHaveBeenCalledTimes(1);
		FakeAudio.last.onended?.();
		expect(onEnd).toHaveBeenCalledTimes(1);
	});
});
