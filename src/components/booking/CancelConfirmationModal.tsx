'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface CancelConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export function CancelConfirmationModal({
    isOpen,
    onConfirm,
    onCancel,
    loading = false,
    title = "Cancel Booking",
    message = "Are you sure you want to cancel this booking? This action cannot be undone.",
    confirmText = "Yes, Cancel",
    cancelText = "Keep Booking"
}: CancelConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white"
                        disabled={loading}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-300 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1"
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
