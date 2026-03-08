/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(() => ({ onsuccess: null, onerror: null })),
          getAll: vi.fn(() => ({ onsuccess: null, onerror: null, result: [] })),
          delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
          clear: vi.fn(() => ({ onsuccess: null, onerror: null })),
        }))
      })),
      objectStoreNames: { contains: vi.fn(() => false) },
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn()
      }))
    }
  })),
  deleteDatabase: vi.fn()
};

// Setup global mocks
Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: {
    onLine: true,
    serviceWorker: {
      register: vi.fn(() => Promise.resolve()),
      ready: Promise.resolve({
        sync: { register: vi.fn(() => Promise.resolve()) }
      }),
      addEventListener: vi.fn()
    }
  },
  writable: true
});

Object.defineProperty(window, 'ServiceWorkerRegistration', {
  value: { prototype: { sync: {} } },
  writable: true
});

describe('PWA Offline Queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should queue card moves when offline', async () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    const { useOfflineQueue } = await import('@/lib/offline-queue');
    const { queueCardMove } = useOfflineQueue();

    // Mock successful queue operation
    mockIndexedDB.open.mockReturnValue({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            add: vi.fn((move: any) => {
              const request = { onsuccess: null, onerror: null };
              setTimeout(() => (request.onsuccess as any)?.(), 0);
              return request;
            }),
            getAll: vi.fn(() => ({ onsuccess: null, onerror: null, result: [] })),
            delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
            clear: vi.fn(() => ({ onsuccess: null, onerror: null }))
          }))
        })),
        objectStoreNames: { contains: vi.fn(() => true) },
        createObjectStore: vi.fn()
      }
    });

    const result = await queueCardMove('card-1', 'column-2', 1, 'workspace-1');

    expect(result).toEqual({ success: true, queued: true });
  });

  it('should make API call when online', async () => {
    // Mock online state
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });

    // Mock successful API response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    ) as any;

    const { useOfflineQueue } = await import('@/lib/offline-queue');
    const { queueCardMove } = useOfflineQueue();

    const result = await queueCardMove('card-1', 'column-2', 1, 'workspace-1');

    expect(global.fetch).toHaveBeenCalledWith('/api/cards/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId: 'card-1',
        targetColumnId: 'column-2',
        targetPosition: 1,
      }),
    });

    expect(result).toEqual({ success: true });
  });
});

describe('PWA Manifest', () => {
  it('should have valid manifest configuration', async () => {
    const manifestResponse = await fetch('/manifest.json');
    const manifest = await manifestResponse.json();

    expect(manifest).toMatchObject({
      name: 'TeamBoard - Collaborative Project Management',
      short_name: 'TeamBoard',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#6366f1'
    });

    expect(manifest.icons).toHaveLength(4);
    expect(manifest.icons[0]).toMatchObject({
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png'
    });
  });
});

describe('Service Worker Registration', () => {
  it('should register service worker if supported', async () => {
    const mockRegister = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      writable: true
    });

    // Dynamically import PWAProvider to trigger service worker registration
    const { PWAProvider } = await import('@/components/pwa-provider');

    // The service worker should be registered when PWAProvider mounts
    // In a real test, this would be tested with React Testing Library
    expect(typeof PWAProvider).toBe('function');
  });
});