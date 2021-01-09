const PRECACHE = "precache-v1";
const RUNTIME = "runtime";
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/images/icons/icon-192x192.png',
    '/assets/images/icons/icon-512x512.png',
    '/assets/js/db.js',
    '/assets/js/index.js',
    '/dist/manifest.json',
    '/dist/assets/images/icons/icon_96x96.png',
    '/dist/assets/images/icons/icon_128x128.png',
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

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
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
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
self.addEventListener("fetch", event => {
    // Check if request from API was succesful
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches
                .open(RUNTIME)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            // If the API response is successful, clone data and store in the cache
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err => {
                            // If the network request failed, try to get it from the cache
                            return cache.match(event.request);
                        });
                }).catch(err => console.log(err))
        );

        return;
    }

    // Use cache first for all other requests for performance
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );

});