import { createContext, useContext, ReactNode } from 'react';
import { useUserLocation, Location } from '@/hooks/useUserLocation';

interface LocationContextType {
    location: Location | null;
    isLoading: boolean;
    error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const locationData = useUserLocation();

    return (
        <LocationContext.Provider value={locationData}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
