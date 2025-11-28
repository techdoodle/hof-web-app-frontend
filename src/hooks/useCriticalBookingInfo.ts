import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CriticalBookingInfo {
    // Core capacity
    playerCapacity: number;      // Total regular slots (e.g., 14 for 7v7)
    bufferCapacity: number;      // Additional buffer slots allowed (e.g., 4)

    // Booking status
    bookedSlots: number;         // Total confirmed slots (from booking_slots table)
    lockedSlots: number;        // Slots currently in payment process
    waitlistedSlots: number;    // Total waitlisted slots (from waitlist_entries table)

    // Derived availability (calculated on server)
    availableRegularSlots: number; // playerCapacity - bookedSlots - lockedSlots
    availableWaitlistSlots: number; // totalCapacity - usedSlots (where usedSlots = booked + locked + waitlisted)

    // Booking config
    offerPrice: number;
    slotPrice: number;
    isLocked: boolean;

    // Team information
    teamAName: string;          // Name of team A
    teamBName: string;          // Name of team B
    perTeamCapacity: number;    // Capacity per team (playerCapacity / 2)
    teamASlots: number;         // Currently booked slots for team A
    teamBSlots: number;         // Currently booked slots for team B
    unassignedSlots: number;    // Slots not assigned to any team
    availableTeamASlots: number; // Available slots for team A
    availableTeamBSlots: number; // Available slots for team B
}

export function useCriticalBookingInfo(matchId: string | number, options?: any) {
    return useQuery({
        queryKey: ['critical-booking-info', matchId],
        queryFn: async () => {
            const response = await api.get(`/matches/${matchId}/booking-info`);
            return response.data as CriticalBookingInfo;
        },
        refetchInterval: 30000, // Refetch every 10 seconds
        retry: 3, // Max 3 retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        staleTime: 5000, // Consider data stale after 5 seconds
        ...options
    });
}
