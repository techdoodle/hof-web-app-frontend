import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { API_CONFIG } from '@/config/api';
import { getAccessToken } from '@/lib/utils/auth';

export function NotificationTest() {
    const { subscription, loading, error, subscribe, unsubscribe } = usePushNotifications();

    const resetNotifications = async () => {
        try {
            // Unregister all service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));

            // Unsubscribe if there's an existing subscription
            if (subscription) {
                await unsubscribe();
            }

            // Refresh to clean state
            window.location.reload();
        } catch (error) {
            console.error('Error resetting notifications:', error);
        }
    };

    const sendTestNotification = async () => {
        if (!subscription) {
            await subscribe();
            return;
        }
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${API_CONFIG.baseURL}/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(subscription),
            });

            const result = await response.json();
            if (result.success) {
                console.log('Test notification sent successfully');
            } else {
                console.error('Failed to send test notification');
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-4 space-y-2">
            <button
                onClick={sendTestNotification}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                {subscription ? 'Send Test Notification' : 'Subscribe & Test'}
            </button>
            <button
                onClick={resetNotifications}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
                Reset Notifications
            </button>
        </div>
    );
}