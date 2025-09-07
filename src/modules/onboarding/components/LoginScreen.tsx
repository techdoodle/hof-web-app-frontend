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
      console.log("in catchhh", err);
      setValidationError('Network Error! Please try again later.');
    }
  };

  // Check if phone number is valid (exactly 10 digits)
  const isPhoneNumberValid = phoneNumber.length === 10;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="flex flex-col items-start justify-center h-full">
          <div className="text-2xl font-boldtext-white text-left font-semibold mb-4 font-orbitron">LOGIN</div>
          <div className="text-white mb-2">Enter your mobile number *</div>
          <div className="w-full">
            <div>
              <div className="relative flex items-center w-full rounded-lg gradient-border p-2 bg-background focus-within:gradient-border-selected">
                <span className="pl-4 pr-2 text-foreground/80 select-none">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    // Only allow numbers, max 10 digits
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(val);
                    // Clear validation error when user starts typing
                    if (validationError) {
                      setValidationError('');
                    }
                  }}
                  placeholder="XXXXXXXXXX"
                  className="flex-1 p-2 pl-0 bg-transparent outline-none text-foreground placeholder-gray-500 input-gradient-border text-lg"
                  maxLength={10}
                  required
                />
              </div>

              {/* WhatsApp number information */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-xs font-bold">i</span>
                </div>
                <span className="text-green-400 text-md">Please provide Whatsapp number</span>
              </div>

              {validationError && (
                <p className="mt-2 text-sm text-red-500">{validationError}</p>
              )}
              {/* {error && (
                <p className="mt-2 text-sm text-red-500">{error.message}</p>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Continue Button with Android viewport fix */}
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
            variant="gradient"
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full"
            disabled={!isPhoneNumberValid || isLoading}
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
} 