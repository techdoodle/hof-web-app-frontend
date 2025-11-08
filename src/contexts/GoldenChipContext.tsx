'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { GoldenChipNotification } from '@/components/common/GoldenChipNotification';

interface GoldenChipNotificationData {
    id: string;
    message: string;
    duration?: number;
}

interface GoldenChipContextType {
    showNotification: (message: string, duration?: number) => void;
}

const GoldenChipContext = createContext<GoldenChipContextType | undefined>(undefined);

export function useGoldenChip() {
    const context = useContext(GoldenChipContext);
    if (!context) {
        throw new Error('useGoldenChip must be used within a GoldenChipProvider');
    }
    return context;
}

interface GoldenChipProviderProps {
    children: ReactNode;
}

export function GoldenChipProvider({ children }: GoldenChipProviderProps) {
    const [notifications, setNotifications] = useState<GoldenChipNotificationData[]>([]);

    const showNotification = useCallback((message: string, duration = 3000) => {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const newNotification: GoldenChipNotificationData = {
            id,
            message,
            duration,
        };

        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    return (
        <GoldenChipContext.Provider value={{ showNotification }}>
            {children}
            {/* Render notifications - only show the first one at a time */}
            {notifications.length > 0 && (
                <GoldenChipNotification
                    key={notifications[0].id}
                    message={notifications[0].message}
                    isVisible={true}
                    duration={notifications[0].duration}
                    onComplete={() => removeNotification(notifications[0].id)}
                />
            )}
        </GoldenChipContext.Provider>
    );
}

