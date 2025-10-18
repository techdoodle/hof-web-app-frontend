import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/config/api';

interface PushNotificationState {
    supported: boolean;
    subscription: PushSubscription | null;
    error: string | null;
    loading: boolean;
}

export function usePushNotifications() {
    const [state, setState] = useState<PushNotificationState>({
        supported: false,
        subscription: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        const checkSupport = async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                setState(prev => ({
                    ...prev,
                    supported: false,
                    loading: false,
                    error: 'Push notifications are not supported',
                }));
                return;
            }

            try {
                const registration = await navigator.serviceWorker.register('/push-notification-sw.js');
                const subscription = await registration.pushManager.getSubscription();

                setState(prev => ({
                    ...prev,
                    supported: true,
                    subscription,
                    loading: false,
                }));
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    supported: false,
                    loading: false,
                    error: 'Failed to register service worker',
                }));
            }
        };

        checkSupport();
    }, []);

    const getAccessToken = () => {
        return localStorage.getItem('accessToken');
    };

    const subscribe = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));

            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('Not authenticated');
            }

            const registration = await navigator.serviceWorker.ready;

            // Get VAPID public key from backend
            const response = await fetch(`${API_CONFIG.baseURL}/notifications/vapid-public-key`);
            const { publicKey } = await response.json();

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKey,
            });

            // Send subscription to backend
            const subscribeResponse = await fetch(`${API_CONFIG.baseURL}/notifications/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(subscription),
            });

            if (!subscribeResponse.ok) {
                throw new Error('Failed to save subscription');
            }

            setState(prev => ({
                ...prev,
                subscription,
                loading: false,
                error: null,
            }));

            return true;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to subscribe to push notifications',
            }));
            return false;
        }
    };

    const unsubscribe = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));

            if (state.subscription) {
                await state.subscription.unsubscribe();
            }

            setState(prev => ({
                ...prev,
                subscription: null,
                loading: false,
                error: null,
            }));

            return true;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to unsubscribe from push notifications',
            }));
            return false;
        }
    };

    return {
        ...state,
        subscribe,
        unsubscribe,
    };
}