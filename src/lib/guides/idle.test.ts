import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createIdleWatcher } from './idle';

describe('idle watcher', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const start = () => {
		const onNudge = vi.fn();
		const w = createIdleWatcher({ firstMs: 30_000, secondMs: 75_000, onNudge });
		w.reset();
		return { w, onNudge };
	};

	it('nudges gently at 30s and with the step hint at 75s', () => {
		const { onNudge } = start();
		vi.advanceTimersByTime(29_999);
		expect(onNudge).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(onNudge).toHaveBeenLastCalledWith(1);
		vi.advanceTimersByTime(45_000);
		expect(onNudge).toHaveBeenLastCalledWith(2);
	});

	it('then leaves the learner alone', () => {
		const { onNudge } = start();
		vi.advanceTimersByTime(10 * 60_000);
		expect(onNudge).toHaveBeenCalledTimes(2);
	});

	it('any activity starts the count again', () => {
		const { w, onNudge } = start();
		vi.advanceTimersByTime(20_000);
		w.reset();
		vi.advanceTimersByTime(29_000);
		expect(onNudge).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1_000);
		expect(onNudge).toHaveBeenCalledWith(1);
	});

	it('stop cancels both nudges', () => {
		const { w, onNudge } = start();
		w.stop();
		vi.advanceTimersByTime(10 * 60_000);
		expect(onNudge).not.toHaveBeenCalled();
	});
});
