'use client';

import { useState } from 'react';
import { UserData } from '@/modules/onboarding/types';
import { Button } from '@/lib/ui/components/Button/Button';
import { CityDropdown } from '@/components/common/CityDropdown';
import { useCities } from '@/hooks/useCities';

interface EditNameFormProps {
    userData: UserData;
    onSave: (data: { firstName: string; lastName: string; city: any }) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function EditNameForm({ userData, onSave, onCancel, isLoading }: EditNameFormProps) {
    const [formData, setFormData] = useState({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        city: userData.city?.cityName || '',
    });

    const { cities, isLoading: citiesLoading } = useCities();

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.city) {
            return;
        }

        const cityData = cities.find(city => city.cityName === formData.city);
        await onSave({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            city: cityData?.id || formData.city
        });
    };

    const isFormValid = formData.firstName.trim() && formData.lastName.trim() && formData.city;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">
                Let us know how to properly address you
            </p>

            <div>
                <label className="text-white text-sm font-semibold block mb-2">
                    First name
                </label>
                <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Pranab"
                    className="w-full p-3 rounded-xl border border-gray-600 bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            </div>

            <div>
                <label className="text-white text-sm font-semibold block mb-2">
                    Last name (optional)
                </label>
                <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Gambhir"
                    className="w-full p-3 rounded-xl border border-gray-600 bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            </div>

            <div>
                <label className="text-white text-sm font-semibold block mb-2">
                    City
                </label>
                <CityDropdown
                    cities={cities}
                    selectedCity={formData.city}
                    onCityChange={(cityName) => handleChange('city', cityName)}
                    disabled={citiesLoading}
                    className="w-full"
                />
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
                    disabled={!isFormValid || isLoading}
                    isLoading={isLoading}
                    className="flex-1"
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
