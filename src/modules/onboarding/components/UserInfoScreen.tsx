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
    // Since we removed queryClient from repository, we'll use the cities array directly
    // We need to find the city ID by name from the cities array
    const cityId = cities.findIndex(city => city === formData.city) + 1; // Assuming city IDs start from 1
    console.log("formData", formData, cities, cityId);
    // setCurrentStep('GENDER_SELECTION');
    await onSubmit({...formData, city: cityId});
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
        <div className="space-y-4 w-full max-w-full overflow-x-auto">
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
            className="w-full max-w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            disabled={citiesLoading}
          >
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