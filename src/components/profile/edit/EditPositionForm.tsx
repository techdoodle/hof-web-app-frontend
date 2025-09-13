'use client';

import { useState } from 'react';
import { UserData } from '@/modules/onboarding/types';
import { Button } from '@/lib/ui/components/Button/Button';

interface EditPositionFormProps {
    userData: UserData;
    onSave: (position: string) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

const positions = [
    { value: 'STRIKER', label: 'Striker/Midfielder', icon: '⚡' },
    { value: 'DEFENDER', label: 'Defender', icon: '🛡️' },
    { value: 'GOALKEEPER', label: 'Goalkeeper', icon: '🥅' },
] as const;

export function EditPositionForm({ userData, onSave, onCancel, isLoading }: EditPositionFormProps) {
    const [selectedPosition, setSelectedPosition] = useState<string>(
        userData.playerCategory || ''
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPosition) return;
        await onSave(selectedPosition);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">
                Knowing your preferences help us tailor your experience
            </p>

            <div className="space-y-3">
                {positions.map((position) => (
                    <button
                        key={position.value}
                        type="button"
                        onClick={() => setSelectedPosition(position.value)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedPosition === position.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-600 bg-gray-800/50 text-white hover:border-gray-500'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{position.icon}</span>
                            <span className="font-medium">{position.label}</span>
                        </div>
                        <div
                            className={`w-6 h-6 rounded-full border-2 transition-all ${selectedPosition === position.value
                                ? 'border-primary bg-primary'
                                : 'border-gray-500'
                                }`}
                        >
                            {selectedPosition === position.value && (
                                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="gradient"
                    disabled={!selectedPosition || isLoading}
                    isLoading={isLoading}
                    className="flex-1"
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
