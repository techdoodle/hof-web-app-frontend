'use client';

import { useQuery } from '@tanstack/react-query';
import { OnboardingRepository } from '@/modules/onboarding/repository/onboarding.repository';

interface City {
    id: number;
    cityName: string;
}

const CITIES_QUERY_KEY = 'cities';
const CITIES_STALE_TIME = 60 * 60 * 1000; // 1 hour (cities don't change frequently)

export function useCities() {
    const repository = OnboardingRepository.getInstance();

    const {
        data: cities = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: [CITIES_QUERY_KEY],
        queryFn: async (): Promise<City[]> => {
            // Use the new method that returns actual city IDs from backend
            return await repository.fetchCitiesWithIds();
        },
        staleTime: CITIES_STALE_TIME,
        refetchOnWindowFocus: false, // Don't refetch when window gains focus
    });

    return {
        cities,
        isLoading,
        error,
        refetch
    };
}
