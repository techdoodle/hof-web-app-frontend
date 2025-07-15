'use client';

import { usePWA } from '@/hooks/usePWA';
import { useEffect, useState } from 'react';

export default function PWATestPage() {
  const { isInstalled, isStandalone, isOnline, shareContent, requestWakeLock, markAsInstalled, markAsUninstalled } = usePWA();
  const [isClient, setIsClient] = useState(false);
  const [detectionDetails, setDetectionDetails] = useState({
    standalone: false,
    localStorage: false,
    apiSupported: false,
    userAgent: '',
  });

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      // Check detection methods
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      
      const localStorage = window.localStorage.getItem('pwa-installed') === 'true';
      const apiSupported = 'getInstalledRelatedApps' in navigator;
      
      setDetectionDetails({
        standalone,
        localStorage,
        apiSupported,
        userAgent: navigator.userAgent,
      });
    }
  }, []);

  const handleShare = async () => {
    const shared = await shareContent({
      title: 'Humans of Football',
      text: 'Check out this amazing football community app!',
      url: window.location.origin,
    });
    
    if (!shared) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  };

  const handleWakeLock = async () => {
    const wakeLock = await requestWakeLock();
    if (wakeLock) {
      alert('Wake lock activated!');
    } else {
      alert('Wake lock not supported');
    }
  };

  if (!isClient) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">PWA Test Page</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">PWA Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-green-500 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">PWA Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Installed:</span>
              <span className={isInstalled ? 'text-green-600' : 'text-red-600'}>
                {isInstalled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Standalone Mode:</span>
              <span className={isStandalone ? 'text-green-600' : 'text-red-600'}>
                {isStandalone ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Online:</span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-500 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Detection Methods</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Standalone Mode:</span>
              <span className={detectionDetails.standalone ? 'text-green-600' : 'text-red-600'}>
                {detectionDetails.standalone ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>LocalStorage:</span>
              <span className={detectionDetails.localStorage ? 'text-green-600' : 'text-red-600'}>
                {detectionDetails.localStorage ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>API Supported:</span>
              <span className={detectionDetails.apiSupported ? 'text-green-600' : 'text-red-600'}>
                {detectionDetails.apiSupported ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-600">
                <strong>User Agent:</strong> {detectionDetails.userAgent.slice(0, 50)}...
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-500 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">PWA Features</h2>
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Test Web Share API
            </button>
            <button
              onClick={handleWakeLock}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Test Wake Lock API
            </button>
            <button
              onClick={() => window.location.href = '/offline'}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Test Offline Page
            </button>
          </div>
        </div>

        <div className="bg-green-500 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manual Controls</h2>
          <div className="space-y-3">
            <button
              onClick={markAsInstalled}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
            >
              Mark as Installed
            </button>
            <button
              onClick={markAsUninstalled}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Mark as Uninstalled
            </button>
            <p className="text-xs text-gray-600">
              Use these buttons to manually test the installation state
            </p>
          </div>
        </div>

        <div className="bg-green-500 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Service Worker</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Registered:</span>
              <span className="text-green-600">
                {typeof window !== 'undefined' && 'serviceWorker' in navigator ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Push Notifications:</span>
              <span className="text-green-600">
                {typeof window !== 'undefined' && 'PushManager' in window ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-500 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Device APIs</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Geolocation:</span>
              <span className="text-green-600">
                {typeof window !== 'undefined' && 'geolocation' in navigator ? 'Supported' : 'Not Supported'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Camera:</span>
              <span className="text-green-600">
                {typeof window !== 'undefined' && 'mediaDevices' in navigator ? 'Supported' : 'Not Supported'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Vibration:</span>
              <span className="text-green-600">
                {typeof window !== 'undefined' && 'vibrate' in navigator ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How Installation Detection Works:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Standalone Mode:</strong> Most reliable - checks if app is running without browser UI</li>
          <li><strong>LocalStorage:</strong> Remembers installation state across sessions</li>
          <li><strong>getInstalledRelatedApps API:</strong> Chrome-only API to check installed apps</li>
          <li><strong>Event Listeners:</strong> Listens for 'appinstalled' and 'beforeinstallprompt' events</li>
        </ul>
      </div>

      <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Installation Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Chrome/Edge:</strong> Look for the install icon in the address bar</li>
          <li><strong>Safari:</strong> Tap the share button and select "Add to Home Screen"</li>
          <li><strong>Firefox:</strong> Look for the install prompt or use the menu</li>
        </ul>
      </div>
    </div>
  );
} 