'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastProps } from '@/components/ui/Toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

interface ToastProviderProps {
    children: ReactNode;
}

interface ToastItem extends ToastProps {
    id: string;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, type: ToastProps['type'] = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);

        const newToast: ToastItem = {
            id,
            message,
            type,
            duration,
            onClose: () => removeToast(id)
        };

        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-sm px-4">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
