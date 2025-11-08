'use client';

import { useEffect, useState } from 'react';

export interface GoldenChipNotificationProps {
    message: string;
    isVisible: boolean;
    duration?: number; // How long to stay visible before sliding out (in ms)
    onComplete?: () => void; // Callback when animation completes
}

export function GoldenChipNotification({
    message,
    isVisible,
    duration = 3000,
    onComplete
}: GoldenChipNotificationProps) {
    const [animationState, setAnimationState] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden');

    useEffect(() => {
        if (isVisible) {
            // Start entering animation
            setAnimationState('entering');

            // After entering animation completes, show as visible
            const enterTimer = setTimeout(() => {
                setAnimationState('visible');
            }, 400); // Match animation duration

            // After duration, start exiting
            const exitTimer = setTimeout(() => {
                setAnimationState('exiting');

                // After exiting animation completes, hide and call onComplete
                const completeTimer = setTimeout(() => {
                    setAnimationState('hidden');
                    onComplete?.();
                }, 400); // Match animation duration

                return () => clearTimeout(completeTimer);
            }, duration + 400);

            return () => {
                clearTimeout(enterTimer);
                clearTimeout(exitTimer);
            };
        } else {
            setAnimationState('hidden');
        }
    }, [isVisible, duration, onComplete]);

    if (animationState === 'hidden') {
        return null;
    }

    const getAnimationClass = () => {
        if (animationState === 'entering') {
            return 'animate-slide-in-from-right';
        } else if (animationState === 'exiting') {
            return 'animate-slide-out-to-right';
        }
        return '';
    };

    return (
        <div
            className={`fixed bottom-26 left-1/2 z-[60] ${getAnimationClass()}`}
            style={{
                animationFillMode: 'forwards',
                ...(animationState === 'visible' && !getAnimationClass() ? { transform: 'translateX(-50%)' } : {}),
            }}
        >
            <div
                className="px-2 py-1 rounded-full"
                style={{
                    background: 'linear-gradient(135deg, #F8D568 0%, #F4C430 50%, #FFD700 100%)',
                    boxShadow: '0px 4px 12px rgba(248, 213, 104, 0.4), 0px 0px 20px rgba(255, 215, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    minWidth: '280px',
                    textAlign: 'center',
                }}
            >
                <p className="text-white font-semibold text-xs whitespace-nowrap" style={{
                    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
                    fontFamily: 'var(--font-orbitron), sans-serif'
                }}>
                    {message}
                </p>
            </div>
        </div>
    );
}

