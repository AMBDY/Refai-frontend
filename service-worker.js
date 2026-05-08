/**
 * RefAI - Service Worker for Offline-First PWA
 * Handles offline caching and background sync
 */

const CACHE_NAME = 'refai-v1';
const OFFLINE_QUEUE = 'refai-offline-queue';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/referee-operation.html',
    '/styles.css',
    '/js/config.js',
    '/js/common.js',
    '/js/theme.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Deleting old cache:', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request)
                    .then((response) => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch((error) => {
                        console.log('🔴 Network error:', error);
                        // Return offline page if available
                        return caches.match('/offline.html');
                    });
            })
    );
});

// Background Sync - handle offline queue
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-match-events') {
        console.log('🔄 Service Worker: Syncing offline events...');
        
        event.waitUntil(
            syncOfflineEvents()
        );
    }
});

// Sync offline events to server
async function syncOfflineEvents() {
    try {
        // Get offline queue from IndexedDB
        const db = await openDB();
        const tx = db.transaction('offline-events', 'readonly');
        const store = tx.objectStore('offline-events');
        const events = await store.getAll();
        
        console.log(`📤 Syncing ${events.length} offline events...`);
        
        // Send each event to server
        for (const event of events) {
            try {
                const response = await fetch(`${event.url}`, {
                    method: event.method,
                    headers: event.headers,
                    body: JSON.stringify(event.data)
                });
                
                if (response.ok) {
                    // Remove from offline queue
                    const deleteTx = db.transaction('offline-events', 'readwrite');
                    const deleteStore = deleteTx.objectStore('offline-events');
                    await deleteStore.delete(event.id);
                    console.log(`✅ Synced event ${event.id}`);
                } else {
                    console.log(`⚠️ Failed to sync event ${event.id}`);
                }
            } catch (error) {
                console.log(`❌ Error syncing event ${event.id}:`, error);
            }
        }
        
        // Notify app that sync is complete
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                synced: events.length
            });
        });
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

// Open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('refai-offline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offline-events')) {
                db.createObjectStore('offline-events', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

console.log('✅ Service Worker loaded successfully');
