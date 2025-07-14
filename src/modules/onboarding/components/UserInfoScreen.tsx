import { useState } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { OnboardingStep, UserInfo } from '../types';

interface UserInfoScreenProps {
  onSubmit: (userInfo: UserInfo) => Promise<void>;
  isLoading: boolean;
  error?: Error | null;
  setCurrentStep: (step: OnboardingStep) => void;
}

export function UserInfoScreen({
  onSubmit,
  isLoading,
  error,
  setCurrentStep,
}: UserInfoScreenProps) {
  const [formData, setFormData] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    city: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formData", formData);
    setCurrentStep('GENDER_SELECTION');
    // await onSubmit(formData);
  };

  const handleChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-2">What's your name?</h1>
      <p className="text-gray-400 mb-8">Let us know how to properly address you</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-4">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Enter First Name"
            className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Enter Last Name"
            className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter City"
            className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}

        <div className="mt-auto">
          <Button 
            type="submit" 
            isLoading={isLoading} 
            size="lg" 
            variant="gradient"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
} 