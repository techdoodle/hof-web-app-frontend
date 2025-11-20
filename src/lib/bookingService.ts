import api from './api';

export interface CreateBookingRequest {
    matchId: number;
    userId?: string;
    email: string;
    totalSlots: number;
    slotNumbers: number[];
    metadata?: Record<string, any>;
}

export interface InitiatePaymentRequest {
    bookingId: string;
    amount: number;
    currency: string;
    email: string;
    metadata?: Record<string, any>;
}

export interface PaymentCallbackRequest {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface VerifySlotsRequest {
    matchId: string;
    slots: Array<{
        phone: string;
        slotNumber?: number;
    }>;
}

export interface VerifySlotsResponse {
    isValid: boolean;
    conflicts: Array<{
        phone: string;
        userId?: number;
        reason: string;
        source: Array<'match_participant' | 'booking_slot'>;
    }>;
    message: string;
}

export interface BookingResponse {
    id: string;
    matchId: number;
    userId?: string;
    email: string;
    bookingReference: string;
    totalSlots: number;
    status: string;
    amount?: number;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface RefundBreakdown {
    refundPercentage: number;
    refundAmount: number;
    hoursUntilMatch: number;
    eligibleForRefund: boolean;
    perSlotAmount: number;
    totalSlotsToCancel: number;
    baseRefundAmount: number;
    timeWindow: 'FULL_REFUND' | 'PARTIAL_REFUND' | 'NO_REFUND';
}

export interface PaymentInitiationResponse {
    booking: BookingResponse;
    razorpayOrder: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
    };
}

export class BookingService {
    static async checkSlotAvailability(matchId: string, numSlots: number): Promise<{ availableSlots: number }> {
        const response = await api.get(`/matches/${matchId}/availability?slots=${numSlots}`);
        return response.data;
    }

    static async createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
        console.log('Creating booking with data:', data);
        console.log('API base URL:', api.defaults.baseURL);
        console.log('Request headers:', api.defaults.headers);

        const response = await api.post('/bookings', data);
        return response.data;
    }

    static async initiatePayment(data: InitiatePaymentRequest): Promise<PaymentInitiationResponse> {
        const response = await api.post(`/bookings/${data.bookingId}/payment`, data);
        return response.data;
    }

    static async cancelPayment(bookingId: string): Promise<void> {
        const response = await api.post(`/bookings/${bookingId}/cancel-payment`);
        return response.data;
    }

    static async handlePaymentCallback(
        bookingId: string,
        data: PaymentCallbackRequest
    ): Promise<BookingResponse> {
        const response = await api.post(`/bookings/${bookingId}/payment/callback`, data);
        return response.data;
    }

    static async getBooking(bookingId: string): Promise<BookingResponse> {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
    }

    static async getBookings(filters?: {
        userId?: string;
        email?: string;
        status?: string;
    }): Promise<BookingResponse[]> {
        const response = await api.get('/bookings', { params: filters });
        return response.data;
    }

    static async getBookingById(bookingId: string): Promise<BookingResponse> {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
    }

    static async cancelBooking(bookingId: string): Promise<void> {
        await api.delete(`/bookings/${bookingId}`);
    }

    static async cancelBookingSlots(data: {
        bookingId: string;
        slotNumbers: number[];
        reason?: string;
    }): Promise<void> {
        await api.delete(`/bookings/${data.bookingId}/slots`, {
            data: {
                slotNumbers: data.slotNumbers,
                reason: data.reason
            }
        });
    }

    static async verifySlots(data: VerifySlotsRequest): Promise<VerifySlotsResponse> {
        const response = await api.post('/bookings/verify-slots', data);
        return response.data;
    }

    static async getRefundBreakdown(bookingId: string, slotNumbers?: number[]): Promise<RefundBreakdown> {
        const params: any = {};
        if (slotNumbers && slotNumbers.length > 0) {
            params.slotNumbers = slotNumbers.join(',');
        }
        const response = await api.get(`/bookings/${bookingId}/refund-breakdown`, { params });
        return response.data;
    }
}
