import { useState, useEffect } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { GenderSelectionSchema, GenderSelection } from '../types';
import { CameraSelfieModal } from './CameraSelfieModal';
import { OnboardingRepository } from '../repository/onboarding.repository';
import { getAccessToken, getUser } from '@/lib/utils/auth';
import { UserData } from '../types';

interface GenderSelectionScreenProps {
  onSubmit: (data: GenderSelection & { profilePicture?: string }) => Promise<void>;
  isLoading: boolean;
  error?: Error | null;
  userName?: string;
  userData?: UserData;
}

export function GenderSelectionScreen({
  onSubmit,
  isLoading,
  error,
  userData,
}: GenderSelectionScreenProps) {
  console.log('userData', userData);
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const repository = OnboardingRepository.getInstance();

  useEffect(() => {
    if (userData) {
      setSelectedGender(userData.gender as 'MALE' | 'FEMALE' | 'OTHER');
      setProfilePicture(userData.profilePicture);
    }
  }, [userData]);

  const handleSubmit = async () => {
    if (!selectedGender) {
      setValidationError('Please select your gender');
      return;
    }

    if (!profilePicture) {
      setValidationError('Please take a profile picture');
      return;
    }

    try {
      GenderSelectionSchema.parse({ gender: selectedGender });
      setValidationError('');
      await onSubmit({
        gender: selectedGender,
        ...(profilePicture && { profilePicture })
      });
    } catch (err) {
      setValidationError('Please select a valid option');
    }
  };

  const handleCameraCapture = async (originalImage: string, processedImage: string, faceBounds: { x: number, y: number, width: number, height: number }) => {
    setShowCamera(false);
    setIsProcessingImage(true);
    setProcessingError(null);

    try {
      const token = getAccessToken();
      const user = getUser();

      if (!token) {
        throw new Error('No authentication token available');
      }

      // Send the original image to backend for processing
      const result = await repository.processOnlyProfilePictureBase64(originalImage, token);

      // Set the processed image URL
      setProfilePicture(result.url);
      setIsProcessingImage(false);
    } catch (error) {
      console.error('Image processing failed:', error);
      setProcessingError('Failed to process image. Please try again.');
      setIsProcessingImage(false);

      // Fallback: use the original image
      setProfilePicture(originalImage);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <h1 className="text-2xl font-bold font-orbitron">
          Hello {userData?.firstName}!
        </h1>
        <p className="text-gray-400 mb-4">Tell us more about you</p>

        <div className="mb-4">
          <h2 className="text-lg mb-2">Select your gender</h2>

          <div className="space-y-2">
            {[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Prefer not to say' }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-600 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <span className="text-white">{option.label}</span>
                <div className="relative">
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={selectedGender === option.value}
                    onChange={(e) => setSelectedGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 ${selectedGender === option.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-400'
                    } flex items-center justify-center`}>
                    {selectedGender === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-mb mb-2">Click your photo *</h2>

          <div className="flex flex-col items-center">
            <div className="relative">
              <button
                onClick={() => setShowCamera(true)}
                disabled={isProcessingImage}
                className="relative w-32 h-32 mx-auto rounded-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                {isProcessingImage ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <span className="text-xs text-gray-400">Processing...</span>
                  </div>
                ) : profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    <span className="text-sm text-gray-400">Take Selfie!</span>
                  </>
                )}
              </button>
            </div>

            {processingError && (
              <>
                {/* <p className="mt-2 text-sm text-red-500 text-center">{processingError}</p> */}
                <p className="mt-2 text-sm text-yellow-500 text-center">Click on continue, we will process your photo in the background</p>
              </>
            )}

            {!processingError && profilePicture && !isProcessingImage && (
              <p className="mt-2 text-md text-green-500 text-center">
                ✓ Photo captured successfully
              </p>
            )}
          </div>
        </div>

        {validationError && (
          <p className="mb-4 text-sm text-red-600">{validationError}</p>
        )}

        {error && (
          <p className="mb-4 text-sm text-red-600">{error.message}</p>
        )}
      </div>

      {/* Fixed Continue Button */}
      <div
        className="fixed left-0 right-0 p-4 keyboard-safe"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(to top, var(--background) 70%, transparent)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          size="lg"
          variant="gradient"
          disabled={!selectedGender || !profilePicture || isProcessingImage}
          className="w-full"
        >
          Continue
        </Button>
      </div>

      {showCamera && (
        <CameraSelfieModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
} 