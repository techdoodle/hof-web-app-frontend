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
}
