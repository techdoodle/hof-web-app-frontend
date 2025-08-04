import { useEffect, useState } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { OnboardingStep, UserData, UserInfo } from '../types';
import { OnboardingRepository } from '../repository/onboarding.repository';
import { useQueryClient } from '@tanstack/react-query';

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

  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    city: userData.city ? userData.city.cityName : '',
    gender: 'MALE',
  });
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const repo = OnboardingRepository.getInstance();
        const cityList = await repo.fetchCities();
        setCities(cityList);
        // Default to Pune if available, else first city
        setFormData((prev) => ({
          ...prev,
          city: userData.city ? userData.city.cityName :  (cityList.includes('Pune') ? 'Pune' : (cityList[0] || '')),
        }));
      } catch (e) {
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (userData) {
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        city: userData.city ? userData.city.cityName : '',
        gender: (validGenders.includes(userData.gender) ? userData.gender : 'MALE') as 'MALE' | 'FEMALE' | 'OTHER',
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.firstName.trim()) {
      return; // Button will be disabled, but add visual feedback
    }
    if (!formData.lastName.trim()) {
      return;
    }
    if (!formData.city) {
      return;
    }
    
    // Since we removed queryClient from repository, we'll use the cities array directly
    // We need to find the city ID by name from the cities array
    const cityId = cities.findIndex(city => city === formData.city);
    console.log("formData", formData, cities, cityId);
    // setCurrentStep('GENDER_SELECTION');
    await onSubmit({...formData, city: cityId});
  };

  const handleChange = (field: keyof UserInfo, value: string) => {
    console.log('debugging handleChange', field, value);
    console.log('debugging formData', formData);
    console.log('debugging cities', cities, cities.findIndex(city => city === value));
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if all required fields are filled
  const isFormValid = formData.firstName.trim() && formData.lastName.trim() && formData.city;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <h1 className="text-2xl font-bold mb-2">What's your name?</h1>
        <p className="text-gray-400 mb-8">Let us know how to properly address you</p>

        <div className="space-y-4 w-full max-w-full overflow-x-auto">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Enter First Name *"
            className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            required
          />
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Enter Last Name *"
            className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            required
          />
          <select
            value={formData.city}
            onChange={(e) => handleChange('city' as keyof UserInfo, e.target.value)}
            className="w-full max-w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            disabled={citiesLoading}
            required
          >
            <option value="">Select your city *</option>
            {citiesLoading ? (
              <option>Loading cities...</option>
            ) : cities.length > 0 ? (
              cities.map((city) => (
                <option key={city} value={city} className="bg-background text-white">{city}</option>
              ))
            ) : (
              <option>No cities found</option>
            )}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-4">{error.message}</p>
        )}
      </div>

      {/* Fixed Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <form onSubmit={handleSubmit}>
          <Button 
            type="submit" 
            isLoading={isLoading} 
            size="lg" 
            variant="gradient"
            className="w-full"
            disabled={!isFormValid || isLoading}
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
} 