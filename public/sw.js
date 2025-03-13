const CACHE_NAME = 'being-bored-v1';

// Add the URLs you want to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/about/',
  '/manifest.json',
  '/favicon.svg',
  '/maskable-icon.svg'
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim any clients immediately
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // IMPORTANT: Clone the response. A response can only be used
        // once. Since we want to return the response and also store it
        // in the cache, we need to clone it.
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            // Store the response in cache even if it's from a different origin
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, responseToCache);
            }
          });

        return response;
      })
      .catch((err) => {
        // Network failed, try to get it from the cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If the request is for a page navigation and we don't have it in cache,
            // return the cached home page as a fallback
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }

            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
}); 