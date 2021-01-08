// const { cache } = require("webpack");

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/images/icons/icon-192x192.png',
    '/assets/images/icons/icon-512x512.png',
    '/assets/index.js',
    '/dist/bundle.js',
    '/dist/manifest.json'
];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

// Install 
self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activate
self.addEventListener("activate", event => {
    const currentCaches = [PRECACE, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.incluedes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Run
self.addEventListener('fetch', event => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then((cache) => {
                    return fetch(event.request).then((response) => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }

    // Use cache first for all other requests for performance
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // Request is not in cache. make network request and cache the response
            return caches.open(RUNTIME_CACHE).then(cache => {
                return fetch(event.request).then(response => {
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );

});