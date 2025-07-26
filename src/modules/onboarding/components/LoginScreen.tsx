import { useEffect, useState } from 'react';
import { PhoneNumberSchema } from '../types';
import { Button } from '@/lib/ui/components/Button/Button';
import Image from 'next/image';
import { useOnbaordingNavigation } from '@/lib/ui/context/OnbaordingNavigationContext';
import { ArrowLeft } from 'lucide-react';

interface LoginScreenProps {
  onSubmit: (phoneNumber: string) => Promise<void>;
  isLoading: boolean;
  error?: Error | null;
  onBack: () => void;
}

export function LoginScreen({ onSubmit, isLoading, error, onBack }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validationError, setValidationError] = useState('');
  const { setOnBack, setShowBackButton } = useOnbaordingNavigation();

  useEffect(() => {
    setOnBack(() => {
      setShowBackButton(true);
    });
  }, [setOnBack, setShowBackButton]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      setValidationError('Please enter a valid 10-digit phone number.');
      return;
    }
    
    try {
      PhoneNumberSchema.parse(phoneNumber);
      setValidationError('');
      await onSubmit(phoneNumber);
    } catch (err) {
      setValidationError('Please enter a valid phone number with country code (e.g. +91)');
    }
  };

  return (
    <div className="flex flex-col items-start justify-center flex-1 h-full">
      <div className="text-2xl font-boldtext-white text-left font-semibold mb-16">LOGIN</div>
      <div className="text-white mb-2">Enter your mobile number</div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
        <div>
          <div className="relative flex items-center w-full rounded-lg gradient-border p-2 bg-background">
            <span className="pl-4 pr-2 text-foreground/80 select-none">+91</span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                // Only allow numbers, max 10 digits
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhoneNumber(val);
              }}
              placeholder="XXXXXXXXXX"
              className="flex-1 p-2 pl-0 bg-transparent outline-none text-foreground placeholder-gray-500 input-gradient-border"
              // className="w-fullflex-1 p-4 pl-0 bg-transparent outline-none text-foreground placeholder-gray-500"
              maxLength={10}
            />
          </div>
          
          {/* WhatsApp number information */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-black text-xs font-bold">i</span>
            </div>
            <span className="text-green-400 text-sm">Please provide Whatsapp number</span>
          </div>
          
          {validationError && (
            <p className="mt-2 text-sm text-red-500">{validationError}</p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-500">{error.message}</p>
          )}
        </div>

        <div className="mt-auto">
          <Button 
            variant="gradient"
            type="submit" 
            isLoading={isLoading} 
            size="lg" 
            // className="w-full bg-primary text-background hover:shadow-neon transition-all duration-300"
          >
            Continue
          </Button>

        </div>
      </form>
    </div>
  );
} 