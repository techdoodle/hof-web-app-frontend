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

    static async initiateWaitlistBooking(waitlistId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
    }> {
        const response = await api.post(`/waitlist/${waitlistId}/initiate-booking`);
        return response.data;
    }

    static async confirmWaitlistBooking(
        waitlistId: string,
        paymentOrderId: string,
        paymentId: string,
        signature: string
    ): Promise<any> {
        const response = await api.post(`/waitlist/${waitlistId}/confirm-booking`, {
            paymentOrderId,
            paymentId,
            signature
        });
        return response.data;
    }

    static async getWaitlistEntry(waitlistId: string): Promise<any> {
        const response = await api.get(`/waitlist/${waitlistId}`);
        return response.data;
    }
}
