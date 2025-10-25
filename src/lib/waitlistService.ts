import api from './api';

export interface JoinWaitlistRequest {
    matchId: string;
    email: string;
    slotsRequired: number;
    metadata?: {
        players: Array<{
            firstName?: string;
            lastName?: string;
            phone: string;
        }>;
    };
}

export interface WaitlistResponse {
    waitlistEntry: {
        id: string;
        matchId: number;
        email: string;
        slotsRequired: number;
        status: string;
        createdAt: string;
    };
    matchDetails: {
        venueName: string;
        venueAddress: string;
        startTime: string;
        endTime: string;
        date: string;
        footballChief: {
            name: string;
            phone: string;
        };
    };
}

export class WaitlistService {
    static async joinWaitlist(data: JoinWaitlistRequest): Promise<WaitlistResponse> {
        const response = await api.post('/waitlist/join', data);
        return response.data;
    }

    static async cancelWaitlist(matchId: string, email: string): Promise<void> {
        await api.delete(`/waitlist/cancel?matchId=${matchId}&email=${email}`);
    }

    static async getWaitlistCount(matchId: string): Promise<{ count: number }> {
        const response = await api.get(`/waitlist/count?matchId=${matchId}`);
        return response.data;
    }
}
