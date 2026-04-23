// Offline cache setup for the site.

// Cache names
const CACHE_VERSION = 'ecosphere-v4';
const RUNTIME_CACHE = 'ecosphere-runtime-v4';

// Files we want available offline
const ASSETS_TO_CACHE = [
  'index.html',
  'categories.html',
  'case-study.html',
  'heroes.html',
  'task.html',
  'countries.html',
  'india.html',
  'international.html',
  'feedback.html',
  'privacy.html',
  'terms.html',
  'disclaimer.html',
  'license.html',
  'offline.html',
  'css/defs.css',
  'css/base.css',
  'css/components.css',
  'css/layout.css',
  'css/pages.css',
  'js/navigation.js',
  'js/modals.js',
  'js/search-filter.js',
  'js/forms.js',
  'js/main.js',
  'manifest.json',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/shortcut-organizations.svg',
  'assets/icons/shortcut-feedback.svg',
  'assets/icons/shortcut-tasks.svg',
  'assets/icons/screenshot-narrow.svg'
];

// Save fresh network responses in the runtime cache.
function updateRuntimeCache(request, response) {
  if (!response || response.status !== 200) {
    return;
  }

  caches.open(RUNTIME_CACHE).then(function (cache) {
    cache.put(request, response.clone());
  });
}

// Cache the app shell when the worker is installed.
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(function (cache) {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(function () {
        self.skipWaiting();
      })
      .catch(function (error) {
        console.error('[Service Worker] Cache install failed:', error);
      })
  );
});

// Remove older cache versions when a new worker takes over.
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        const oldCaches = cacheNames.filter(function (cacheName) {
          return cacheName !== CACHE_VERSION && cacheName !== RUNTIME_CACHE;
        });

        return Promise.all(
          oldCaches.map(function (cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
      .then(function () {
        self.clients.claim();
      })
  );
});

// Serve cached content first, then refresh in the background when possible.
self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      if (cachedResponse) {
        fetch(request)
          .then(function (networkResponse) {
            updateRuntimeCache(request, networkResponse);
          })
          .catch(function () {});

        return cachedResponse;
      }

      return fetch(request)
        .then(function (networkResponse) {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(request, networkResponse.clone());
          });

          return networkResponse;
        })
        .catch(function () {
          if (request.destination === 'document') {
            return caches.match('offline.html').then(function (offlinePage) {
              if (offlinePage) {
                return offlinePage;
              }

              return caches.match('index.html');
            });
          }

          return new Response('Offline - content unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// Allow the page to ask the waiting worker to activate right away.
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
