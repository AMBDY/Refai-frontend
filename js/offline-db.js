/**
 * RefAI - IndexedDB Manager for Offline Storage
 * Stores match events when offline, syncs when online
 */

class OfflineDB {
    constructor() {
        this.dbName = 'refai-offline';
        this.version = 1;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('❌ IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('offline-events')) {
                    const eventStore = db.createObjectStore('offline-events', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    eventStore.createIndex('timestamp', 'timestamp', { unique: false });
                    eventStore.createIndex('matchId', 'matchId', { unique: false });
                    eventStore.createIndex('synced', 'synced', { unique: false });
                }

                if (!db.objectStoreNames.contains('match-state')) {
                    db.createObjectStore('match-state', { keyPath: 'matchId' });
                }

                console.log('✅ IndexedDB schema created');
            };
        });
    }

    // Save match event offline
    async saveEvent(eventData) {
        const tx = this.db.transaction(['offline-events'], 'readwrite');
        const store = tx.objectStore('offline-events');

        const event = {
            ...eventData,
            timestamp: Date.now(),
            synced: false,
            retries: 0
        };

        return new Promise((resolve, reject) => {
            const request = store.add(event);
            request.onsuccess = () => {
                console.log('💾 Event saved offline:', event);
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get all unsynced events
    async getUnsyncedEvents() {
        const tx = this.db.transaction(['offline-events'], 'readonly');
        const store = tx.objectStore('offline-events');
        const index = store.index('synced');

        return new Promise((resolve, reject) => {
            const request = index.getAll(false);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Mark event as synced
    async markSynced(eventId) {
        const tx = this.db.transaction(['offline-events'], 'readwrite');
        const store = tx.objectStore('offline-events');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(eventId);
            
            getRequest.onsuccess = () => {
                const event = getRequest.result;
                if (event) {
                    event.synced = true;
                    event.syncedAt = Date.now();
                    const putRequest = store.put(event);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    resolve();
                }
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // Delete synced events (cleanup)
    async deleteSyncedEvents() {
        const tx = this.db.transaction(['offline-events'], 'readwrite');
        const store = tx.objectStore('offline-events');
        const index = store.index('synced');

        return new Promise((resolve, reject) => {
            const request = index.openCursor(true);
            let deleted = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deleted++;
                    cursor.continue();
                } else {
                    console.log(`🗑️ Deleted ${deleted} synced events`);
                    resolve(deleted);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Save entire match state
    async saveMatchState(matchId, stateData) {
        const tx = this.db.transaction(['match-state'], 'readwrite');
        const store = tx.objectStore('match-state');

        const data = {
            matchId,
            ...stateData,
            lastUpdated: Date.now()
        };

        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Get match state
    async getMatchState(matchId) {
        const tx = this.db.transaction(['match-state'], 'readonly');
        const store = tx.objectStore('match-state');

        return new Promise((resolve, reject) => {
            const request = store.get(matchId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get event count
    async getEventCount() {
        const tx = this.db.transaction(['offline-events'], 'readonly');
        const store = tx.objectStore('offline-events');

        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

ssl: { rejectUnauthorized: false }

// Export for use in other scripts
window.OfflineDB = OfflineDB;

console.log('✅ OfflineDB class loaded');
