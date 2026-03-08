interface OfflineCardMove {
  id: string;
  cardId: string;
  targetColumnId: string;
  targetPosition: number;
  timestamp: number;
  workspaceSlug: string;
}

interface OfflineStorage {
  cardMoves: OfflineCardMove[];
  lastSyncTime: number;
}

class OfflineQueue {
  private dbName = 'TeamBoardOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
      this.setupServiceWorkerSync();
    }
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('cardMoves')) {
          const cardMovesStore = db.createObjectStore('cardMoves', { keyPath: 'id' });
          cardMovesStore.createIndex('timestamp', 'timestamp', { unique: false });
          cardMovesStore.createIndex('workspaceSlug', 'workspaceSlug', { unique: false });
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  private setupServiceWorkerSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_OFFLINE_MOVES') {
          this.syncPendingMoves().catch(console.error);
        }
      });
    }
  }

  async queueCardMove(
    cardId: string,
    targetColumnId: string,
    targetPosition: number,
    workspaceSlug: string
  ): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const move: OfflineCardMove = {
      id: `${cardId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cardId,
      targetColumnId,
      targetPosition,
      timestamp: Date.now(),
      workspaceSlug
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cardMoves'], 'readwrite');
      const store = transaction.objectStore('cardMoves');
      const request = store.add(move);

      request.onsuccess = () => {
        console.log('Card move queued offline:', move);
        this.requestBackgroundSync();
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to queue card move:', request.error);
        reject(request.error);
      };
    });
  }

  async getPendingMoves(): Promise<OfflineCardMove[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cardMoves'], 'readonly');
      const store = transaction.objectStore('cardMoves');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get pending moves:', request.error);
        reject(request.error);
      };
    });
  }

  async removePendingMove(moveId: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cardMoves'], 'readwrite');
      const store = transaction.objectStore('cardMoves');
      const request = store.delete(moveId);

      request.onsuccess = () => {
        console.log('Pending move removed:', moveId);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to remove pending move:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllPendingMoves(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cardMoves'], 'readwrite');
      const store = transaction.objectStore('cardMoves');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All pending moves cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear pending moves:', request.error);
        reject(request.error);
      };
    });
  }

  async syncPendingMoves(): Promise<void> {
    const pendingMoves = await this.getPendingMoves();

    if (pendingMoves.length === 0) {
      console.log('No pending moves to sync');
      return;
    }

    console.log(`Syncing ${pendingMoves.length} pending card moves`);

    for (const move of pendingMoves) {
      try {
        await this.syncSingleMove(move);
        await this.removePendingMove(move.id);
        console.log('Successfully synced move:', move.id);
      } catch (error) {
        console.error('Failed to sync move:', move.id, error);
        // Keep the move in the queue for retry
        break; // Stop on first failure to maintain order
      }
    }

    await this.updateLastSyncTime();
  }

  private async syncSingleMove(move: OfflineCardMove): Promise<void> {
    const response = await fetch('/api/cards/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId: move.cardId,
        targetColumnId: move.targetColumnId,
        targetPosition: move.targetPosition,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync card move: ${response.status} ${response.statusText}`);
    }
  }

  private async updateLastSyncTime(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({
        key: 'lastSyncTime',
        value: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLastSyncTime(): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get('lastSyncTime');

      request.onsuccess = () => {
        resolve(request.result?.value || 0);
      };

      request.onerror = () => {
        console.error('Failed to get last sync time:', request.error);
        reject(request.error);
      };
    });
  }

  private requestBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (registration as any).sync?.register('offline-card-moves');
      }).catch(error => {
        console.error('Background sync registration failed:', error);
      });
    } else {
      // Fallback: try to sync immediately
      setTimeout(() => {
        this.syncPendingMoves().catch(console.error);
      }, 1000);
    }
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  async hasPendingMoves(): Promise<boolean> {
    const moves = await this.getPendingMoves();
    return moves.length > 0;
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();

// Hook for React components
export function useOfflineQueue() {
  const queueCardMove = async (
    cardId: string,
    targetColumnId: string,
    targetPosition: number,
    workspaceSlug: string
  ) => {
    if (navigator.onLine) {
      // If online, make the API call directly
      const response = await fetch('/api/cards/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          targetColumnId,
          targetPosition,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to move card: ${response.status}`);
      }

      return response.json();
    } else {
      // If offline, queue the move
      await offlineQueue.queueCardMove(cardId, targetColumnId, targetPosition, workspaceSlug);

      // Return a success-like response for optimistic UI
      return { success: true, queued: true };
    }
  };

  return {
    queueCardMove,
    getPendingMoves: () => offlineQueue.getPendingMoves(),
    syncPendingMoves: () => offlineQueue.syncPendingMoves(),
    isOnline: () => offlineQueue.isOnline(),
    hasPendingMoves: () => offlineQueue.hasPendingMoves()
  };
}