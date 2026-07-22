/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

// SvelteKit service worker. Built only for production by default; `$service-worker`
// provides the current deployment's asset lists and a unique `version`.
//
// Strategy (narrow offline MVP — B5):
//  - Precache the app shell (hashed build output + static files + prerendered pages)
//    on install; serve those cache-first.
//  - Navigations: network-first, fall back to cache, then to the /offline page — so
//    already-visited pages keep working without a connection.
//  - Other same-origin GETs (e.g. lesson content under /content): network-first with
//    a cache fallback, populating a runtime cache so visited lessons stay readable.
//  - API/auth routes are never cached and never intercepted.
//  - Old caches keyed by a previous `version` are cleaned up on activate.

import { build, files, prerendered, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const APP_CACHE = `app-shell-${version}`;
const RUNTIME_CACHE = `runtime-${version}`;

// Immutable, content-hashed build output — safe to serve cache-first forever.
const PRECACHE_BUILD = new Set(build);
// Full precache manifest: build + static files + prerendered pages.
const PRECACHE = [...build, ...files, ...prerendered];

// The offline fallback is SSR-rendered (not prerendered), so it's precached
// separately at install time via a network fetch — tolerantly, so a failure
// here can never break the whole install.
const OFFLINE_URL = '/offline';

function isApiOrAuth(url: URL): boolean {
	return (
		url.pathname.startsWith('/api/') || url.pathname === '/api' || url.pathname.startsWith('/login')
	);
}

sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(APP_CACHE);
			await cache.addAll(PRECACHE);
			// Best-effort: don't let an offline-page fetch failure abort the install.
			try {
				await cache.add(OFFLINE_URL);
			} catch {
				// ignore — navigationHandler still degrades gracefully.
			}
			await sw.skipWaiting();
		})()
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys
					.filter((key) => key !== APP_CACHE && key !== RUNTIME_CACHE)
					.map((key) => caches.delete(key))
			);
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;

	// Only ever touch GET requests over http(s); everything else goes to the network.
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

	// Never cache or intercept authenticated data / auth flows.
	if (url.origin === location.origin && isApiOrAuth(url)) return;

	// Cross-origin requests: leave to the network (avoid caching opaque responses).
	if (url.origin !== location.origin) return;

	// 1. Immutable build assets → cache-first.
	if (PRECACHE_BUILD.has(url.pathname)) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// 2. Navigations → network-first, fall back to cache, then the offline page.
	if (request.mode === 'navigate') {
		event.respondWith(navigationHandler(request));
		return;
	}

	// 3. Other same-origin GETs (static files, lesson content) → network-first
	//    with a runtime cache fallback so visited resources survive offline.
	event.respondWith(networkFirst(request));
});

async function cacheFirst(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response.ok) {
		const cache = await caches.open(APP_CACHE);
		cache.put(request, response.clone());
	}
	return response;
}

async function navigationHandler(request: Request): Promise<Response> {
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) return cached;
		const offline = await caches.match(OFFLINE_URL);
		if (offline) return offline;
		return new Response('Είστε εκτός σύνδεσης.', {
			status: 503,
			headers: { 'Content-Type': 'text/plain; charset=utf-8' }
		});
	}
}

async function networkFirst(request: Request): Promise<Response> {
	try {
		const response = await fetch(request);
		if (response.ok && response.type === 'basic') {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) return cached;
		throw new Error('Network error and no cache for ' + request.url);
	}
}
