import { useState } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { UserInfo, UserInfoSchema } from '../types';

interface UserInfoScreenProps {
  onSubmit: (userInfo: UserInfo) => Promise<void>;
  isLoading: boolean;
  error?: Error | null;
}

export function UserInfoScreen({
  onSubmit,
  isLoading,
  error,
}: UserInfoScreenProps) {
  const [formData, setFormData] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    gender: 'MALE',
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      UserInfoSchema.parse(formData);
      setValidationError('');
      await onSubmit(formData);
    } catch (err) {
      setValidationError('Please fill in all required fields');
    }
  };

  const handleChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-2">What's our name?</h1>
      <p className="text-gray-600 mb-8">Let us know how to properly address you</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-4">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Enter First Name"
            className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Enter Last Name"
            className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select your gender
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleChange('gender', 'MALE')}
              className={`p-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                formData.gender === 'MALE'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">♂️</span>
              Male
            </button>
            <button
              type="button"
              onClick={() => handleChange('gender', 'FEMALE')}
              className={`p-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                formData.gender === 'FEMALE'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">♀️</span>
              Female
            </button>
          </div>
        </div>

        {(validationError || error) && (
          <p className="text-sm text-red-600">
            {validationError || error?.message}
          </p>
        )}

        <div className="mt-auto">
          <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
} 