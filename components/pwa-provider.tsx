'use client';

import { useEffect, useState } from 'react';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingSync, setHasPendingSync] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available, show update notification
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_OFFLINE_MOVES') {
          setHasPendingSync(false);
        }
      });
    }

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App came online');

      // Try to sync offline moves when coming back online
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if ('sync' in window.ServiceWorkerRegistration.prototype) {
            return (registration as any).sync?.register('offline-card-moves');
          }
        }).catch(console.error);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('App went offline');
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending sync on load
    checkPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingSync = async () => {
    try {
      const { offlineQueue } = await import('@/lib/offline-queue');
      const pendingMoves = await offlineQueue.hasPendingMoves();
      setHasPendingSync(pendingMoves);
    } catch (error) {
      console.error('Error checking pending sync:', error);
    }
  };

  const showUpdateNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('TeamBoard Update Available', {
        body: 'A new version of TeamBoard is available. Reload to update.',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        tag: 'app-update'
      });
    }
  };

  // Request notification permission on first load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  return (
    <>
      {children}

      {/* Offline indicator */}
      {!isOnline && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-center py-2 text-sm font-medium"
          role="banner"
          aria-live="polite"
          data-testid="offline-indicator"
        >
          📱 You&apos;re offline. Your changes will sync when reconnected.
        </div>
      )}

      {/* Pending sync indicator */}
      {isOnline && hasPendingSync && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-2 text-sm font-medium"
          role="banner"
          aria-live="polite"
          data-testid="sync-queue"
        >
          🔄 Syncing offline changes...
        </div>
      )}
    </>
  );
}

export default PWAProvider;