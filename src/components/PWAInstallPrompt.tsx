'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!isClient || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Install Humans of Football</h3>
          <p className="text-sm text-gray-600">
            Get the full experience with our mobile app
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleDismiss}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
} 