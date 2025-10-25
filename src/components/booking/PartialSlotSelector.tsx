'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

interface PartialSlotSelectorProps {
    slots: Array<{
        slotNumber: number;
        playerName: string;
        status: string;
    }>;
    onConfirm: (selectedSlots: number[]) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function PartialSlotSelector({ slots, onConfirm, onCancel, loading = false }: PartialSlotSelectorProps) {
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

    const handleSlotToggle = (slotNumber: number) => {
        setSelectedSlots(prev =>
            prev.includes(slotNumber)
                ? prev.filter(s => s !== slotNumber)
                : [...prev, slotNumber]
        );
    };

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
                        {slots.map((slot) => (
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
                    <div className="mt-3 p-3 bg-orange-900/20 rounded-lg">
                        <div className="text-sm text-orange-300">
                            <strong>Refund Amount:</strong> ₹{Math.round((selectedSlots.length / slots.length) * 100)}% of total booking amount
                        </div>
                        <div className="text-xs text-orange-400 mt-1">
                            Selected slots: {selectedSlots.sort((a, b) => a - b).join(', ')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
