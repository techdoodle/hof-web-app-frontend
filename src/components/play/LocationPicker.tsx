import { useState, useEffect, Fragment } from 'react';
import { locationService } from '@/lib/utils/locationService';
import { MapPinIcon, Loader2Icon, SearchIcon } from 'lucide-react';
import { Button } from '../ui/button';
import api from '@/lib/api';

interface City {
    id: number;
    cityName: string;
    stateName: string;
    latitude: number;
    longitude: number;
}

interface LocationPickerProps {
    onLocationSelected: (location: { latitude: number; longitude: number }) => void;
    className?: string;
}

// Top high-density cities for quick access
const TOP_CITIES = ['Gurugram', 'Mumbai', 'New Delhi', 'Bengaluru', 'Kolkata', 'Goa', 'Jaipur'];

export function LocationPicker({ onLocationSelected, className = '' }: LocationPickerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allCities, setAllCities] = useState<City[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    // Fetch all cities
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await api.get('/cities');
                const data = response.data;
                setAllCities(data);
            } catch (err) {
                console.error('Failed to fetch cities:', err);
                // Fallback cities
                setAllCities([
                    { id: 77, cityName: 'Gurugram', stateName: 'Haryana', latitude: 28.460105, longitude: 77.0266 },
                    { id: 132, cityName: 'Mumbai', stateName: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
                    { id: 143, cityName: 'New Delhi', stateName: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
                    { id: 28, cityName: 'Bengaluru', stateName: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
                ]);
            }
        };

        fetchCities();
    }, []);

    // Filter cities based on search query or show top 5
    const getDisplayCities = (): City[] => {
        if (searchQuery.trim()) {
            // If searching, filter all cities
            const query = searchQuery.toLowerCase().trim();
            return allCities.filter(city =>
                city.cityName.toLowerCase().includes(query) ||
                city.stateName.toLowerCase().includes(query)
            );
        } else {
            // If no search, show only top 5 cities
            return allCities.filter(city =>
                TOP_CITIES.some(topCity => city.cityName.toLowerCase().includes(topCity.toLowerCase()))
            ).slice(0, 5);
        }
    };

    const displayCities = getDisplayCities();

    const handleGetLocation = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Clear permission denied flag to allow retry
            locationService.clearPermissionDenied();

            const coords = await locationService.getCurrentLocation();

            // Cache location using service (validates and adds timestamp)
            locationService.cacheLocation(coords, 'gps');

            // Call onLocationSelected - this passes location as prop to NearbyMatches
            // No need to dispatch locationUpdated event since we're using prop location
            onLocationSelected(coords);
        } catch (err) {
            const errorCode = (err as any)?.code || 'UNKNOWN';
            let errorMessage = 'Failed to get location';

            if (errorCode === 'PERMISSION_DENIED') {
                errorMessage = 'Location access denied. Please enable it in your browser settings.';
            } else if (errorCode === 'TIMEOUT') {
                errorMessage = 'Location request timed out. Please try again.';
            } else if (errorCode === 'POSITION_UNAVAILABLE') {
                errorMessage = 'Unable to determine your location. Please try again.';
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCitySelect = (city: City) => {
        setSelectedCity(city);
        const location = {
            latitude: city.latitude,
            longitude: city.longitude,
        };

        // Cache location using service (validates and adds timestamp)
        locationService.cacheLocation(location, 'manual');

        // Call onLocationSelected - this passes location as prop to NearbyMatches
        // No need to dispatch locationUpdated event since we're using prop location
        onLocationSelected(location);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col items-center gap-3">
                <Button
                    onClick={handleGetLocation}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2"
                >
                    {isLoading ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                        <MapPinIcon className="h-4 w-4" />
                    )}
                    Use my current location
                </Button>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-2 text-gray-400">or select a city</span>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
            </div>

            {/* City List */}
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {displayCities.length > 0 ? displayCities.map((city) => (
                    <Fragment key={city.id}>
                        <Button
                            variant={selectedCity?.id === city.id ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => handleCitySelect(city)}
                        >
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {city.cityName}, {city.stateName}
                        </Button>
                    </Fragment>
                )) : (
                    <div className="text-gray-400 text-sm text-center py-4">
                        {searchQuery.trim() ? 'No cities found for your search' : 'No cities available'}
                    </div>
                )}
            </div>
        </div>
    );
}
