import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

export interface Location {
    latitude: number;
    longitude: number;
}

export function useUserLocation() {
    const [location, setLocation] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const getLocation = async () => {
            try {
                // First try to get from localStorage
                const cachedLocation = localStorage.getItem('userLocation');
                if (cachedLocation) {
                    const parsed = JSON.parse(cachedLocation);
                    setLocation(parsed);
                    setIsLoading(false);
                    return; // Don't try GPS if we have cached location
                }

                // Get current location only if no cached location
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 10000,
                    });
                });

                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                // Cache the location
                localStorage.setItem('userLocation', JSON.stringify(newLocation));
                setLocation(newLocation);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
                setError(errorMessage);
                showToast('Please enable location access to find nearby matches', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        getLocation();
    }, [showToast]);

    // Listen for localStorage changes (when city is selected)
    useEffect(() => {
        const handleStorageChange = () => {
            const cachedLocation = localStorage.getItem('userLocation');
            if (cachedLocation) {
                try {
                    const parsed = JSON.parse(cachedLocation);
                    setLocation(parsed);
                    setError(null);
                } catch (err) {
                    console.error('Failed to parse cached location:', err);
                }
            }
        };

        // Listen for storage events from other tabs/windows
        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events (for same-tab updates)
        window.addEventListener('locationUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('locationUpdated', handleStorageChange);
        };
    }, []);

    return { location, isLoading, error };
}
