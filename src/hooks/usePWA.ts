'use client';

import { useState, useEffect } from 'react';

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Method 1: Check if app is running in standalone mode (most reliable)
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://');
    };

    // Method 2: Check using getInstalledRelatedApps API (Chrome only)
    const checkInstalledRelatedApps = async () => {
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await (navigator as any).getInstalledRelatedApps();
          return relatedApps.length > 0;
        } catch (error) {
          console.log('getInstalledRelatedApps not supported or failed:', error);
          return false;
        }
      }
      return false;
    };

    // Method 3: Check localStorage for installation state
    const checkLocalStorageInstalled = () => {
      return localStorage.getItem('pwa-installed') === 'true';
    };

    // Method 4: Check if running in standalone mode OR was manually marked as installed
    const checkInstalled = async () => {
      // If running in standalone mode, it's definitely installed
      if (checkStandalone()) {
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }

      // Check if previously installed (stored in localStorage)
      if (checkLocalStorageInstalled()) {
        return true;
      }

      // Check using the API (Chrome only)
      const apiInstalled = await checkInstalledRelatedApps();
      if (apiInstalled) {
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }

      return false;
    };

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Initialize states
    const initializeStates = async () => {
      setIsStandalone(checkStandalone());
      setIsInstalled(await checkInstalled());
      updateOnlineStatus();
    };

    initializeStates();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      localStorage.setItem('pwa-installed', 'true');
      setIsInstalled(true);
    });

    // Listen for beforeinstallprompt (indicates app can be installed)
    window.addEventListener('beforeinstallprompt', () => {
      console.log('PWA can be installed');
      // App is installable but not yet installed
      if (!checkStandalone()) {
        setIsInstalled(false);
      }
    });

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const requestWakeLock = async () => {
    if (typeof window === 'undefined') return null;
    
    if ('wakeLock' in navigator) {
      try {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        return wakeLock;
      } catch (err) {
        console.error('Failed to request wake lock:', err);
      }
    }
    return null;
  };

  const shareContent = async (data: { title?: string; text?: string; url?: string }) => {
    if (typeof window === 'undefined') return false;
    
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
    return false;
  };

  const addToHomeScreen = () => {
    if (typeof window === 'undefined') return;
    
    // This will be handled by the PWAInstallPrompt component
    const event = new CustomEvent('show-install-prompt');
    window.dispatchEvent(event);
  };

  const markAsInstalled = () => {
    localStorage.setItem('pwa-installed', 'true');
    setIsInstalled(true);
  };

  const markAsUninstalled = () => {
    localStorage.removeItem('pwa-installed');
    setIsInstalled(false);
  };

  return {
    isInstalled,
    isStandalone,
    isOnline,
    requestWakeLock,
    shareContent,
    addToHomeScreen,
    markAsInstalled,
    markAsUninstalled,
  };
} 