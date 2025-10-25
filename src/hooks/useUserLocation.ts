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
                    // Still update in background
                }

                // Get current location
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

    return { location, isLoading, error };
}
