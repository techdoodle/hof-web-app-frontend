'use client';

import { useEffect } from 'react';

export function CacheClearer() {
  useEffect(() => {
    // Only run on client side and only when explicitly requested
    if (typeof window !== 'undefined' && window.location.search.includes('clear-cache')) {
      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }
    }
  }, []);

  return null; // This component doesn't render anything
} 