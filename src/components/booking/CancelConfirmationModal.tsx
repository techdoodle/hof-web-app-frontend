'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Info } from 'lucide-react';
import { RefundBreakdown } from '@/lib/bookingService';

interface CancelConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    refundInfo?: RefundBreakdown;
}

export function CancelConfirmationModal({
    isOpen,
    onConfirm,
    onCancel,
    loading = false,
    title = "Cancel Booking",
    message = "Are you sure you want to cancel this booking? This action cannot be undone.",
    confirmText = "Yes, Cancel",
    cancelText = "Keep Booking",
    refundInfo
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
                    <p className="text-gray-300 leading-relaxed mb-4">
                        {message}
                    </p>
                    
                    {refundInfo && (
                        <div className={`p-4 rounded-lg border ${
                            refundInfo.timeWindow === 'FULL_REFUND' 
                                ? 'bg-green-900/20 border-green-700' 
                                : refundInfo.timeWindow === 'PARTIAL_REFUND'
                                ? 'bg-orange-900/20 border-orange-700'
                                : 'bg-red-900/20 border-red-700'
                        }`}>
                            <div className="flex items-start gap-2 mb-2">
                                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white mb-2">Refund Information</h3>
                                    
                                    {refundInfo.timeWindow === 'FULL_REFUND' && (
                                        <p className="text-green-300 text-sm mb-2">
                                            You are eligible for a <strong>100% refund</strong> (₹{refundInfo.refundAmount.toFixed(2)}) 
                                            as the match is more than 6 hours away.
                                        </p>
                                    )}
                                    
                                    {refundInfo.timeWindow === 'PARTIAL_REFUND' && (
                                        <p className="text-orange-300 text-sm mb-2">
                                            You are eligible for a <strong>50% refund</strong> (₹{refundInfo.refundAmount.toFixed(2)}) 
                                            as the match is between 3-6 hours away.
                                        </p>
                                    )}
                                    
                                    {refundInfo.timeWindow === 'NO_REFUND' && (
                                        <p className="text-red-300 text-sm mb-2">
                                            <strong>No refund</strong> will be processed as the match is less than 3 hours away.
                                        </p>
                                    )}
                                    
                                    <div className="text-xs text-gray-400 mt-2 space-y-1">
                                        <div>Time until match: {refundInfo.hoursUntilMatch > 0 
                                            ? `${Math.floor(refundInfo.hoursUntilMatch)}h ${Math.round((refundInfo.hoursUntilMatch % 1) * 60)}m`
                                            : 'Match has started'
                                        }</div>
                                        <div>Slots to cancel: {refundInfo.totalSlotsToCancel}</div>
                                        {refundInfo.refundAmount > 0 && (
                                            <div>Refund amount: ₹{refundInfo.refundAmount.toFixed(2)}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
