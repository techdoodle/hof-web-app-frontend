'use client';

import { useState } from 'react';
import { UserData } from '@/modules/onboarding/types';
import { Button } from '@/lib/ui/components/Button/Button';

interface EditGenderFormProps {
    userData: UserData;
    onSave: (gender: 'MALE' | 'FEMALE' | 'OTHER') => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function EditGenderForm({ userData, onSave, onCancel, isLoading }: EditGenderFormProps) {
    const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(
        userData.gender as 'MALE' | 'FEMALE' | 'OTHER' || 'MALE'
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(selectedGender);
    };

    const genderOptions = [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' },
    ] as const;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">
                Let us know how to properly address you
            </p>

            <div className="space-y-3">
                {genderOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedGender(option.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedGender === option.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-600 bg-gray-800/50 text-white hover:border-gray-500'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{option.label}</span>
                            <div
                                className={`w-6 h-6 rounded-full border-2 transition-all ${selectedGender === option.value
                                    ? 'border-primary bg-primary'
                                    : 'border-gray-500'
                                    }`}
                            >
                                {selectedGender === option.value && (
                                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </div>
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
                    disabled={isLoading}
                    isLoading={isLoading}
                    className="flex-1"
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
