import { useEffect, useState } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { OnboardingStep, UserData, UserInfo } from '../types';

interface UserInfoScreenProps {
  onSubmit: (userInfo: UserInfo) => Promise<void>;
  isLoading: boolean;
  error?: Error | null;
  setCurrentStep: (step: OnboardingStep) => void;
  userData: UserData;
}

export function UserInfoScreen({
  onSubmit,
  isLoading,
  error,
  setCurrentStep,
  userData,
}: UserInfoScreenProps) {
  const [formData, setFormData] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    city: 'Gurugram',
    gender: 'MALE',
  });

  useEffect(() => {
    console.log("userData", userData);
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        city: (userData.city as any) || 'Gurugram',
        gender: (userData.gender as any) || 'MALE',
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formData", formData);
    // setCurrentStep('GENDER_SELECTION');
    await onSubmit(formData);
  };

  const handleChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value as any, // Type assertion needed for enum values
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
          <select
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="Gurugram" className="bg-background text-white">Gurugram</option>
            <option value="Noida" className="bg-background text-white">Noida</option>
            <option value="Delhi" className="bg-background text-white">Delhi</option>
            <option value="Mumbai" className="bg-background text-white">Mumbai</option>
            <option value="Bengaluru" className="bg-background text-white">Bengaluru</option>
            <option value="Pune" className="bg-background text-white">Pune</option>
          </select>
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