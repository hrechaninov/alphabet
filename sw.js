const cacheFirst = true;
const CACHE_NAME = "v1";
const CACHES_WHITELIST = ["v1"];
const icons = [
	"/icons/main.png",
	"/icons/pause-dark.svg",
	"/icons/pause-light.svg"
];
const images = ["/img/error-pattern.svg"];
const toCache = [
	"/",
	"/bundle.js",
	"/main.css",
	"manifest.json",
	...images,
	...icons
];

self.addEventListener("install", e => {
	e.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(cache => cache.addAll(toCache))
	);
});
self.addEventListener("activate", e => {
	e.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(cacheNames.map(cacheName => {
				if(!CACHES_WHITELIST.includes(cacheName)) return caches.delete(cacheName);
			}));
		})
	);
});
self.addEventListener("fetch", e => {
	e.respondWith(
		caches.match(e.request).then(resp => {
			if(cacheFirst && resp) return resp;
			return fetch(e.request).then(resp => {
				const isDevServerSocket = /.*\/sockjs-node\/.*/.test(e.request.url);
				if(!resp || resp.status !== 200 || isDevServerSocket) return resp;
				const respToCache = resp.clone();
				caches.open(CACHE_NAME).then(cache => cache.put(e.request, respToCache));
				return resp;
			});
		})
	);
});