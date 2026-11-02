const CACHE_NAME = "todo-app-v3";

const STATIC_FILES = [
    "./style.css",
    "./script.js",
    "./img/bg.jpg",
    "./offline.html",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// Save static files in the cache.
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_FILES);
        })
    );

    self.skipWaiting();
});

// Remove old caches.
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
    );

    self.clients.claim();
});

// Handle requests when the application is opened.
self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(request.url);

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    // Use the network first for page navigation.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match("./offline.html");
            })
        );

        return;
    }

    // Use the network first for static files, cache as fallback.
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse.ok) {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }

                return networkResponse;
            })
            .catch(() => caches.match(request))
    );
});