interface Coordinates {
    latitude: number;
    longitude: number;
}

interface LocationError {
    code: number;
    message: string;
}

export const locationService = {
    /**
     * Get user's current location using browser's geolocation API
     * @returns Promise<Coordinates>
     */
    getCurrentLocation(): Promise<Coordinates> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error: LocationError) => {
                    let message = 'An unknown error occurred';
                    switch (error.code) {
                        case 1:
                            message = 'Permission denied. Please enable location access.';
                            break;
                        case 2:
                            message = 'Position unavailable. Please try again.';
                            break;
                        case 3:
                            message = 'Location request timed out. Please try again.';
                            break;
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    },
};
