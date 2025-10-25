declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
        contact?: string;
    };
    notes: Record<string, any>;
    theme: {
        color: string;
    };
    handler: (response: RazorpayResponse) => void;
    modal: {
        ondismiss: () => void;
    };
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const openRazorpayCheckout = (options: RazorpayOptions) => {
    if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
    }

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    return razorpay;
};
