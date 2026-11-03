import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { reveal } from './reveal';

// A stand-in for the few HTMLElement members the action touches, so the test
// runs in the node project without a DOM.
function fakeNode() {
	const classes = new Set<string>();
	const attributes = new Map<string, string>();
	const styles = new Map<string, string>();
	return {
		node: {
			setAttribute: (name: string, value: string) => attributes.set(name, value),
			style: { setProperty: (name: string, value: string) => styles.set(name, value) },
			classList: {
				add: (name: string) => classes.add(name),
				contains: (name: string) => classes.has(name)
			}
		} as unknown as HTMLElement,
		visible: () => classes.has('is-visible'),
		attributes,
		styles
	};
}

type Callback = (entries: { isIntersecting: boolean }[]) => void;

class FakeObserver {
	static last: FakeObserver;
	observed: unknown[] = [];
	unobserved: unknown[] = [];
	disconnects = 0;
	constructor(public callback: Callback) {
		FakeObserver.last = this;
	}
	observe(node: unknown) {
		this.observed.push(node);
	}
	unobserve(node: unknown) {
		this.unobserved.push(node);
	}
	disconnect() {
		this.disconnects++;
	}
}

describe('reveal', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.stubGlobal('IntersectionObserver', FakeObserver);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('marks the node and sets the stagger delay', () => {
		const { node, attributes, styles } = fakeNode();
		reveal(node, { delay: 120 });

		expect(attributes.get('data-reveal')).toBe('');
		expect(styles.get('--reveal-delay')).toBe('120ms');
	});

	it('shows the node at once when there is no IntersectionObserver (SSR, old browsers)', () => {
		vi.stubGlobal('IntersectionObserver', undefined);
		const { node, visible } = fakeNode();

		expect(reveal(node)).toBeUndefined();
		expect(visible()).toBe(true);
	});

	it('shows the node when it scrolls into view, then stops watching it', () => {
		const { node, visible } = fakeNode();
		reveal(node);
		const observer = FakeObserver.last;
		expect(observer.observed).toEqual([node]);

		observer.callback([{ isIntersecting: false }]);
		expect(visible()).toBe(false);

		observer.callback([{ isIntersecting: true }]);
		expect(visible()).toBe(true);
		expect(observer.unobserved).toEqual([node]);
	});

	it('shows the node after 2500 ms even when the observer never fires', () => {
		const { node, visible } = fakeNode();
		reveal(node);

		vi.advanceTimersByTime(2499);
		expect(visible()).toBe(false);

		vi.advanceTimersByTime(1);
		expect(visible()).toBe(true);
		expect(FakeObserver.last.disconnects).toBe(1);
	});

	it('destroy() stops the observer and the safety-net timer', () => {
		const { node, visible } = fakeNode();
		const action = reveal(node);

		action?.destroy();
		expect(FakeObserver.last.disconnects).toBe(1);
		expect(vi.getTimerCount()).toBe(0);

		vi.advanceTimersByTime(5000);
		expect(visible()).toBe(false);
	});
});
