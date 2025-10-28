import { useState, useEffect, Fragment } from 'react';
import { locationService } from '@/lib/utils/locationService';
import { MapPinIcon, Loader2Icon } from 'lucide-react';
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

export function LocationPicker({ onLocationSelected, className = '' }: LocationPickerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    // Fetch initial cities
    useEffect(() => {
        const fetchCities = async () => {
            try {
                // TODO: Replace with actual API call
                const response = await api.get('/cities');
                const data = response.data;
                setCities(data);
            } catch (err) {
                console.error('Failed to fetch cities:', err);
                // For now, use hardcoded cities
                setCities([
                    { id: 77, cityName: 'Gurugram', stateName: 'Haryana', latitude: 28.460105, longitude: 77.0266 },
                    { id: 132, cityName: 'Mumbai', stateName: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
                    { id: 143, cityName: 'New Delhi', stateName: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
                    { id: 28, cityName: 'Bengaluru', stateName: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
                ]);
            }
        };

        fetchCities();
    }, []);

    const handleGetLocation = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const coords = await locationService.getCurrentLocation();
            localStorage.setItem('userLocation', JSON.stringify(coords));

            // Dispatch custom event to notify LocationContext
            window.dispatchEvent(new CustomEvent('locationUpdated'));

            onLocationSelected(coords);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get location');
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
        localStorage.setItem('userLocation', JSON.stringify(location));

        // Dispatch custom event to notify LocationContext
        window.dispatchEvent(new CustomEvent('locationUpdated'));

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
            <div className="grid grid-cols-1 gap-2">
                {cities.length > 0 ? cities.map((city) => (
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
                )) : <div className="text-gray-400 text-sm">No cities found</div>}
            </div>
        </div>
    );
}
