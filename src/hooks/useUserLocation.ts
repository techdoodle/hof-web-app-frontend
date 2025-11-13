import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { locationService } from '@/lib/utils/locationService';

export interface Location {
    latitude: number;
    longitude: number;
}

export function useUserLocation() {
    const [location, setLocation] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const hasShownErrorToast = useRef(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        const getLocation = async () => {
            try {
                // First try to get from cache (validated and not expired)
                const cachedLocation = locationService.getCachedLocation();
                if (cachedLocation) {
                    setLocation(cachedLocation);
                    setError(null);
                    setIsLoading(false);
                    return; // Don't try GPS if we have valid cached location
                }

                // Check if permission was previously denied
                if (locationService.wasPermissionDenied()) {
                    // Set default fallback location when permission is denied
                    const defaultLocation = locationService.getDefaultLocation();
                    locationService.cacheLocation(defaultLocation, 'manual');
                    setLocation(defaultLocation);
                    setError('PERMISSION_DENIED');
                    setIsLoading(false);
                    // Show toast when default location is set
                    if (isInitialMount.current) {
                        showToast('Location has been set by default to Gurugram. To change, go to HoF play section', 'info');
                        hasShownErrorToast.current = true;
                    }
                    return;
                }

                // Check if geolocation is supported
                if (!locationService.isSupported()) {
                    setError('NOT_SUPPORTED');
                    setIsLoading(false);
                    if (isInitialMount.current) {
                        showToast('Geolocation is not supported by your browser', 'error');
                    }
                    return;
                }

                // Get current location only if no cached location
                const newLocation = await locationService.getCurrentLocation({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000, // 1 minute - unified configuration
                });

                setLocation(newLocation);
                setError(null);
                hasShownErrorToast.current = false; // Reset on success
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
                const errorCode = (err as any)?.code || 'UNKNOWN';

                setError(errorCode);

                // Only show toast for permission denied on first attempt, not on every mount
                if (errorCode === 'PERMISSION_DENIED') {
                    if (!hasShownErrorToast.current && isInitialMount.current) {
                        hasShownErrorToast.current = true;
                        // Don't show toast if permission was already denied - user knows
                    }
                } else if (errorCode !== 'PERMISSION_DENIED') {
                    // Show toast for other errors only on initial mount
                    if (isInitialMount.current) {
                        const message = errorCode === 'TIMEOUT'
                            ? 'Location request timed out. Please try again.'
                            : errorCode === 'POSITION_UNAVAILABLE'
                                ? 'Unable to determine your location. Please try again.'
                                : 'Failed to get your location. Please try again.';
                        showToast(message, 'error');
                    }
                }
            } finally {
                setIsLoading(false);
                isInitialMount.current = false;
            }
        };

        getLocation();
    }, [showToast]);

    // Listen for localStorage changes (when city is selected)
    useEffect(() => {
        const handleStorageChange = () => {
            const cachedLocation = locationService.getCachedLocation();
            if (cachedLocation) {
                setLocation(cachedLocation);
                setError(null);
            } else {
                // If cache was cleared, check if we should try to get location again
                if (!locationService.wasPermissionDenied() && locationService.isSupported()) {
                    // Don't auto-retry, just clear the location
                    setLocation(null);
                } else if (locationService.wasPermissionDenied()) {
                    // If permission denied and no cache, set default fallback
                    const defaultLocation = locationService.getDefaultLocation();
                    locationService.cacheLocation(defaultLocation, 'manual');
                    setLocation(defaultLocation);
                    setError('PERMISSION_DENIED');
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

    // Function to manually refresh location (can be exposed if needed)
    const refreshLocation = async () => {
        setIsLoading(true);
        setError(null);
        hasShownErrorToast.current = false;

        try {
            // Clear permission denied flag to allow retry
            locationService.clearPermissionDenied();

            const newLocation = await locationService.getCurrentLocation();
            setLocation(newLocation);
            setError(null);
        } catch (err) {
            const errorCode = (err as any)?.code || 'UNKNOWN';
            setError(errorCode);

            if (errorCode === 'PERMISSION_DENIED') {
                showToast('Please enable location access in your browser settings', 'error');
            } else {
                const message = errorCode === 'TIMEOUT'
                    ? 'Location request timed out. Please try again.'
                    : 'Failed to get your location. Please try again.';
                showToast(message, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { location, isLoading, error, refreshLocation };
}
