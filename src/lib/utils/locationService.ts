interface Coordinates {
    latitude: number;
    longitude: number;
}

interface CachedLocation extends Coordinates {
    timestamp: number;
    source: 'gps' | 'manual';
}

interface LocationError {
    code: number;
    message: string;
}

const LOCATION_CACHE_KEY = 'userLocation';
const LOCATION_CACHE_EXPIRY = 3000 * 60 * 1000; // 300 minutes
const PERMISSION_DENIED_KEY = 'locationPermissionDenied';

export const locationService = {
    /**
     * Check if geolocation is supported
     */
    isSupported(): boolean {
        return typeof navigator !== 'undefined' && 'geolocation' in navigator;
    },

    /**
     * Check if location permission was previously denied
     */
    wasPermissionDenied(): boolean {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(PERMISSION_DENIED_KEY) === 'true';
    },

    /**
     * Mark permission as denied
     */
    markPermissionDenied(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(PERMISSION_DENIED_KEY, 'true');
        }
    },

    /**
     * Clear permission denied flag (when user grants permission)
     */
    clearPermissionDenied(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(PERMISSION_DENIED_KEY);
        }
    },

    /**
     * Validate location coordinates
     */
    validateLocation(location: any): location is Coordinates {
        return (
            location &&
            typeof location === 'object' &&
            typeof location.latitude === 'number' &&
            typeof location.longitude === 'number' &&
            location.latitude >= -90 &&
            location.latitude <= 90 &&
            location.longitude >= -180 &&
            location.longitude <= 180
        );
    },

    /**
     * Get cached location if valid and not expired
     * Handles migration from old format (without timestamp) to new format
     */
    getCachedLocation(): Coordinates | null {
        if (typeof window === 'undefined') return null;

        try {
            const cached = localStorage.getItem(LOCATION_CACHE_KEY);
            if (!cached) return null;

            const parsed: any = JSON.parse(cached);

            // Validate structure (works for both old and new format)
            if (!this.validateLocation(parsed)) {
                localStorage.removeItem(LOCATION_CACHE_KEY);
                return null;
            }

            // After validation, we know parsed has latitude and longitude
            // Check if it's old format (no timestamp) or new format
            // Use type assertion since we know parsed can have additional properties
            const cachedData = parsed as Partial<CachedLocation>;
            const hasTimestamp = typeof cachedData.timestamp === 'number';

            // Migration: If old format (no timestamp), migrate to new format
            if (!hasTimestamp) {
                // Old format detected - migrate to new format with current timestamp
                const migrated: CachedLocation = {
                    latitude: cachedData.latitude!,
                    longitude: cachedData.longitude!,
                    timestamp: Date.now(),
                    source: cachedData.source || 'gps', // Default to 'gps' if not specified
                };
                localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(migrated));
                return {
                    latitude: migrated.latitude,
                    longitude: migrated.longitude,
                };
            }

            // New format: Check expiration
            const now = Date.now();
            if ((now - cachedData.timestamp!) > LOCATION_CACHE_EXPIRY) {
                localStorage.removeItem(LOCATION_CACHE_KEY);
                return null;
            }

            return {
                latitude: cachedData.latitude!,
                longitude: cachedData.longitude!,
            };
        } catch (err) {
            console.error('Failed to parse cached location:', err);
            localStorage.removeItem(LOCATION_CACHE_KEY);
            return null;
        }
    },

    /**
     * Cache location with timestamp
     */
    cacheLocation(location: Coordinates, source: 'gps' | 'manual' = 'gps'): void {
        if (typeof window === 'undefined' || !this.validateLocation(location)) return;

        const cached: CachedLocation = {
            ...location,
            timestamp: Date.now(),
            source,
        };

        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cached));
    },

    /**
     * Clear cached location
     */
    clearCache(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(LOCATION_CACHE_KEY);
        }
    },

    /**
     * Get user's current location using browser's geolocation API
     * @param options - Geolocation options
     * @returns Promise<Coordinates>
     */
    getCurrentLocation(options?: {
        enableHighAccuracy?: boolean;
        timeout?: number;
        maximumAge?: number;
    }): Promise<Coordinates> {
        return new Promise((resolve, reject) => {
            if (!this.isSupported()) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            // Check if permission was previously denied
            if (this.wasPermissionDenied()) {
                reject(new Error('PERMISSION_DENIED'));
                return;
            }

            const defaultOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000, // 1 minute - unified with useUserLocation
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };

                    // Validate before caching
                    if (this.validateLocation(location)) {
                        this.cacheLocation(location, 'gps');
                        this.clearPermissionDenied(); // Clear denied flag on success
                    }

                    resolve(location);
                },
                (error: LocationError) => {
                    let message = 'An unknown error occurred';
                    let errorCode = 'UNKNOWN';

                    switch (error.code) {
                        case 1: // PERMISSION_DENIED
                            message = 'PERMISSION_DENIED';
                            errorCode = 'PERMISSION_DENIED';
                            this.markPermissionDenied();
                            break;
                        case 2: // POSITION_UNAVAILABLE
                            message = 'Position unavailable. Please try again.';
                            errorCode = 'POSITION_UNAVAILABLE';
                            break;
                        case 3: // TIMEOUT
                            message = 'Location request timed out. Please try again.';
                            errorCode = 'TIMEOUT';
                            break;
                    }

                    const errorObj = new Error(message);
                    (errorObj as any).code = errorCode;
                    reject(errorObj);
                },
                { ...defaultOptions, ...options }
            );
        });
    },
};
