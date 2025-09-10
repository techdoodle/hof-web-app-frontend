import { useEffect, useState } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { CityDropdown } from '@/components/common/CityDropdown';
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
  const [cities, setCities] = useState<Array<{ id: number, cityName: string }>>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const repo = OnboardingRepository.getInstance();
        const cityList = await repo.fetchCities();
        // Convert string array to object array with id and cityName
        const citiesWithIds = cityList.map((cityName, index) => ({
          id: index,
          cityName: cityName
        }));
        setCities(citiesWithIds);
        // Default to Pune if available, else first city
        const defaultCity = userData.city ? userData.city.cityName :
          (cityList.includes('Pune') ? 'Pune' : (cityList[0] || ''));
        setFormData((prev) => ({
          ...prev,
          city: defaultCity,
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

    // Find the city ID by name from the cities array
    const cityData = cities.find(city => city.cityName === formData.city);
    const cityId = cityData ? cityData.id : -1;
    console.log("formData", formData, cities, cityId);
    // setCurrentStep('GENDER_SELECTION');
    await onSubmit({ ...formData, city: cityId as any });
  };

  const handleChange = (field: keyof UserInfo, value: string) => {
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
        <h1 className="text-2xl font-bold mb-2 font-orbitron">What's your name?</h1>
        <p className="text-gray mb-8">Let us know how to properly address you</p>

        <div className="space-y-4 w-full max-w-full overflow-x-auto">
          <div>
            <label htmlFor="firstName" className="text-white text-md font-semibold">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="ex: John"
              className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="text-white text-md font-semibold">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="ex: Doe"
              className="w-full p-4 rounded-lg border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="city" className="text-white text-md font-semibold">City</label>
            <CityDropdown
              cities={cities}
              selectedCity={formData.city as string}
              onCityChange={(cityName) => handleChange('city' as keyof UserInfo, cityName)}
              disabled={citiesLoading}
              className="w-full"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-4">{error.message}</p>
        )}
      </div>

      {/* Fixed Continue Button */}
      <div
        className="fixed left-0 right-0 p-4"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(to top, var(--background) 70%, transparent)',
          backdropFilter: 'blur(8px)'
        }}
      >
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