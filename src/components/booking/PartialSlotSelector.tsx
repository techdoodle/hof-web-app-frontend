'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Info, Loader2 } from 'lucide-react';
import { BookingService, RefundBreakdown } from '@/lib/bookingService';

interface PartialSlotSelectorProps {
    bookingId: string;
    slots: Array<{
        slotNumber: number;
        playerName: string;
        status: string;
    }>;
    onConfirm: (selectedSlots: number[]) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function PartialSlotSelector({ bookingId, slots, onConfirm, onCancel, loading = false }: PartialSlotSelectorProps) {
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const [refundInfo, setRefundInfo] = useState<RefundBreakdown | null>(null);
    const [loadingRefund, setLoadingRefund] = useState(false);

    const handleSlotToggle = (slotNumber: number) => {
        setSelectedSlots(prev =>
            prev.includes(slotNumber)
                ? prev.filter(s => s !== slotNumber)
                : [...prev, slotNumber]
        );
    };

    // Fetch refund breakdown when selected slots change
    useEffect(() => {
        const fetchRefundInfo = async () => {
            if (selectedSlots.length === 0) {
                setRefundInfo(null);
                return;
            }

            try {
                setLoadingRefund(true);
                const breakdown = await BookingService.getRefundBreakdown(bookingId, selectedSlots);
                setRefundInfo(breakdown);
            } catch (error) {
                console.error('Failed to fetch refund breakdown:', error);
                setRefundInfo(null);
            } finally {
                setLoadingRefund(false);
            }
        };

        fetchRefundInfo();
    }, [bookingId, selectedSlots]);

    const handleConfirm = () => {
        onConfirm(selectedSlots);
    };

    const isSlotSelected = (slotNumber: number) => selectedSlots.includes(slotNumber);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Select Slots to Cancel</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-3">
                        Choose which slots you want to cancel. You can select multiple slots.
                    </p>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {[...slots].filter((slot) => slot.status === 'ACTIVE').map((slot) => (
                            <div
                                key={slot.slotNumber}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${isSlotSelected(slot.slotNumber)
                                    ? 'border-blue-500 bg-blue-900/20'
                                    : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                onClick={() => handleSlotToggle(slot.slotNumber)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-white">
                                            {slot.playerName}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Slot {slot.slotNumber}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {isSlotSelected(slot.slotNumber) && (
                                            <CheckCircle className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        disabled={selectedSlots.length === 0 || loading}
                    >
                        {loading ? 'Processing...' : `Cancel ${selectedSlots.length} Slot${selectedSlots.length !== 1 ? 's' : ''}`}
                    </Button>
                </div>

                {selectedSlots.length > 0 && (
                    <div className={`mt-3 p-3 rounded-lg border ${
                        loadingRefund 
                            ? 'bg-gray-800/50 border-gray-700'
                            : refundInfo?.timeWindow === 'FULL_REFUND'
                            ? 'bg-green-900/20 border-green-700'
                            : refundInfo?.timeWindow === 'PARTIAL_REFUND'
                            ? 'bg-orange-900/20 border-orange-700'
                            : 'bg-red-900/20 border-red-700'
                    }`}>
                        {loadingRefund ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Calculating refund...</span>
                            </div>
                        ) : refundInfo ? (
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-white mb-1">Refund Information</div>
                                        
                                        {refundInfo.timeWindow === 'FULL_REFUND' && (
                                            <div className="text-sm text-green-300">
                                                <strong>100% refund:</strong> ₹{refundInfo.refundAmount.toFixed(2)} 
                                                <span className="text-xs text-gray-400 ml-2">
                                                    (Match is more than 6 hours away)
                                                </span>
                                            </div>
                                        )}
                                        
                                        {refundInfo.timeWindow === 'PARTIAL_REFUND' && (
                        <div className="text-sm text-orange-300">
                                                <strong>50% refund:</strong> ₹{refundInfo.refundAmount.toFixed(2)} 
                                                <span className="text-xs text-gray-400 ml-2">
                                                    (Match is 3-6 hours away)
                                                </span>
                                            </div>
                                        )}
                                        
                                        {refundInfo.timeWindow === 'NO_REFUND' && (
                                            <div className="text-sm text-red-300">
                                                <strong>No refund</strong> 
                                                <span className="text-xs text-gray-400 ml-2">
                                                    (Match is less than 3 hours away)
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="text-xs text-gray-400 mt-2">
                                            Time until match: {refundInfo.hoursUntilMatch > 0 
                                                ? `${Math.floor(refundInfo.hoursUntilMatch)}h ${Math.round((refundInfo.hoursUntilMatch % 1) * 60)}m`
                                                : 'Match has started'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400">
                                Unable to calculate refund information
                        </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
