import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationPrompt() {
    const { supported, subscription, loading, error, subscribe, unsubscribe } = usePushNotifications();

    if (!supported) {
        return null;
    }

    if (loading) {
        return <div className="text-sm text-gray-600">Loading notification settings...</div>;
    }

    if (error) {
        return <div className="text-sm text-red-600">{error}</div>;
    }

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                    {subscription ? 'Push Notifications Enabled' : 'Enable Push Notifications'}
                </h3>
                <p className="text-sm text-gray-600">
                    {subscription
                        ? 'Stay updated with the latest matches and events'
                        : 'Get notified about new matches and important updates'}
                </p>
            </div>
            <button
                onClick={() => (subscription ? unsubscribe() : subscribe())}
                className={`px-4 py-2 rounded-md text-sm font-medium ${subscription
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
            >
                {subscription ? 'Disable' : 'Enable'}
            </button>
        </div>
    );
}
