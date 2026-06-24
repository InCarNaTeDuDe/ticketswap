const CACHE_NAME = "ticketswap-pwa-cache-v1";
const ASSETS_TO_CACHE = ["/", "/index.html", "/manifest.json", "/icon.svg"];

// Install event - Cache core application shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Pre-caching offline app shell");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      }),
  );
});

// Activate event - Clean up obsolete caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("[Service Worker] Clearing old cache store:", cache);
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// Fetch event - Manage caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. API and dynamic routes must ALWAYS bypass cache and hit the network
  if (url.pathname.startsWith("/api") || url.pathname === "/health") {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "You are offline. Live data is currently unavailable.",
          }),
          { headers: { "Content-Type": "application/json" }, status: 503 },
        );
      }),
    );
    return;
  }

  // 2. Navigation requests (e.g. /overview, /browse, /messages) - SPA Fallback
  // Serve index.html from cache or network to ensure client-side routing works offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/index.html") || caches.match("/");
      }),
    );
    return;
  }

  // 3. Static assets, styles, scripts and media - Stale-while-revalidate strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in the background to update the cache
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn(
              "[Service Worker] Background fetch failed for:",
              request.url,
              err,
            );
          });

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache for next time
      return fetch(request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    }),
  );
});
