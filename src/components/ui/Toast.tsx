'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose?: () => void;
}

export function Toast({ id, message, type = 'info', duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        // Show toast
        setIsVisible(true);

        // Auto close
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsRemoving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300); // Animation duration
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            default:
                return <AlertCircle className="w-5 h-5 text-blue-400" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500/10 border-green-500/20';
            case 'error':
                return 'bg-red-500/10 border-red-500/20';
            case 'warning':
                return 'bg-yellow-500/10 border-yellow-500/20';
            default:
                return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`
                w-full transform transition-all duration-300 ease-in-out
                ${isRemoving ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'}
                ${!isRemoving && isVisible ? 'animate-slide-in-down' : ''}
            `}
        >
            <div className={`
                rounded-lg border backdrop-blur-sm p-4 shadow-lg
                ${getBackgroundColor()}
            `}>
                <div className="flex items-start space-x-3">
                    {getIcon()}
                    <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Animations are defined in global CSS:
// - slideInDown: slides toast down from top
// - fadeOut: fades out when removing
