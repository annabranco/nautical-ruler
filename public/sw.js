const CACHE_NAME = 'nautical-slide-ruler-v1';
const APP_SHELL = [
	'./',
	'./site.webmanifest',
	'./favicon.svg',
	'./favicon.ico',
	'./favicon-16.png',
	'./favicon-32.png',
	'./apple-touch-icon.png',
	'./icon-192.png',
	'./icon-512.png',
	'./nautical-slide-ruler-icon.svg',
	'./sailboat-emblem.png',
];

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
			.then(() => self.clients.claim()),
	);
});

self.addEventListener('fetch', (event) => {
	const request = event.request;
	const url = new URL(request.url);
	if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return;
	if (request.method !== 'GET' || url.origin !== self.location.origin) return;

	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request)
				.then(async (response) => {
					if (response.ok) await caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
					return response;
				})
				.catch(async () => {
					const cachedPage = await caches.match(request);
					return cachedPage || caches.match(new URL('./', self.registration.scope).href);
				}),
		);
		return;
	}

	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) return cached;
			return fetch(request).then(async (response) => {
				if (response.ok) await caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
				return response;
			});
		}),
	);
});
