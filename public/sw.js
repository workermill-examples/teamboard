const CACHE_NAME = 'teamboard-v1';
const STATIC_CACHE_NAME = 'teamboard-static-v1';
const API_CACHE_NAME = 'teamboard-api-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// API patterns for caching
const API_PATTERNS = {
  BOARDS: /^\/api\/workspaces\/[^\/]+\/boards$/,
  BOARD_DETAIL: /^\/api\/workspaces\/[^\/]+\/boards\/[^\/]+$/,
  CARDS: /^\/api\/cards\/[^\/]+$/,
  WORKSPACES: /^\/api\/workspaces$/
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request, url));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handlePageRequest(request, url));
  }
});

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Static asset fetch failed:', error);
    throw error;
  }
}

// Network-first with stale-while-revalidate for API requests
async function handleAPIRequest(request, url) {
  const cacheName = API_CACHE_NAME;

  try {
    // For board detail, use stale-while-revalidate
    if (API_PATTERNS.BOARD_DETAIL.test(url.pathname)) {
      return staleWhileRevalidate(request, cacheName);
    }

    // For other APIs, try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, checking cache for:', url.pathname);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkFetch = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.log('Network fetch failed:', error);
  });

  // Return cached version immediately if available
  if (cachedResponse) {
    networkFetch; // Update cache in background
    return cachedResponse;
  }

  // Otherwise wait for network
  return networkFetch;
}

// Network-first strategy for pages
async function handlePageRequest(request, url) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }

    throw error;
  }
}

// Message handling for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sync event for offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-card-moves') {
    event.waitUntil(syncOfflineCardMoves());
  }
});

// Background sync for card moves
async function syncOfflineCardMoves() {
  try {
    // This will be implemented in the offline queue module
    const event = new MessageEvent('message', {
      data: { type: 'SYNC_OFFLINE_MOVES' }
    });
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage(event.data));
    });
  } catch (error) {
    console.error('Sync failed:', error);
  }
}