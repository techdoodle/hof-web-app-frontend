import { useState, useEffect, useRef } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { GenderSelectionSchema, GenderSelection } from '../types';
import { CameraSelfieModal } from './CameraSelfieModal';
import { OnboardingRepository } from '../repository/onboarding.repository';
import { getAccessToken, getUser } from '@/lib/utils/auth';
import { UserData } from '../types';
import { ImageUploadService } from '@/lib/utils/imageUpload';

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
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('imageLoadError', imageLoadError);
  }, [imageLoadError]);

  const repository = OnboardingRepository.getInstance();

  useEffect(() => {
    if (userData) {
      setSelectedGender(userData.gender as 'MALE' | 'FEMALE' | 'OTHER');
      if (userData.profilePicture && userData.profilePicture !== 'undefined') {
        console.log('Setting profile picture from userData:', userData.profilePicture);
        setProfilePicture(userData.profilePicture);
        setImageLoadError(false);
      }
    }
  }, [userData]);

  // Helper function to add cache-busting for Firebase URLs
  const getImageUrlWithCacheBust = (url: string) => {
    if (!url) return url;

    // If it's a Firebase Storage URL, add cache busting parameter
    if (url.includes('storage.googleapis.com') || url.includes('firebasestorage.googleapis.com')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    }

    return url;
  };

  const handleSubmit = async () => {
    if (!selectedGender) {
      setValidationError('Please select your gender');
      return;
    }

    try {
      GenderSelectionSchema.parse({ gender: selectedGender });
      setValidationError('');

      // If profilePicture is a base64 data URL, upload it to cloud storage first
      let finalProfilePictureUrl: string | undefined = profilePicture ?? undefined;

      if (profilePicture && profilePicture.startsWith('data:image')) {
        console.log('Uploading base64 image to cloud storage...');
        setIsProcessingImage(true);

        try {
          const token = getAccessToken();
          if (!token) {
            throw new Error('No authentication token available');
          }

          // Upload to cloud storage and get permanent URL
          const result = await repository.processProfilePictureBase64(profilePicture, token);
          finalProfilePictureUrl = result.url;

          setIsProcessingImage(false);
        } catch (uploadError) {
          console.error('Failed to upload to cloud storage:', uploadError);
          setProcessingError('Failed to save image. Please try again.');
          setIsProcessingImage(false);
          return;
        }
      }

      await onSubmit({
        gender: selectedGender,
        // Only send profilePicture if the user actually provided one
        ...(finalProfilePictureUrl ? { profilePicture: finalProfilePictureUrl as string } : {})
      });
    } catch (err) {
      setValidationError('Please select a valid option');
      setIsProcessingImage(false);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setProcessingError(null);

    try {
      // Use unified validation and upload service
      const result = await ImageUploadService.validateAndUpload(file, {
        requireValidation: true,
        updateProfile: false // Don't save to profile yet (onboarding)
      });

      if (result.success && result.url) {
        setProfilePicture(result.url);
        setIsProcessingImage(false);
      } else {
        setProcessingError(result.error || 'Failed to process image');
        setIsProcessingImage(false);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setProcessingError('Failed to upload image. Please try again.');
      setIsProcessingImage(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
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
          <h2 className="text-mb mb-2">Add your photo <span className="text-gray-400 text-xs font-normal">(optional)</span></h2>

          <div className="flex flex-col items-center">
            {/* Photo Preview */}
            <div className="relative mb-4">
              <div className="w-32 h-32 mx-auto rounded-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center overflow-hidden">
                {isProcessingImage ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <span className="text-xs text-gray-400">Validating...</span>
                  </div>
                ) : profilePicture && profilePicture !== 'undefined' && !imageLoadError ? (
                  <>
                    <img
                      src={getImageUrlWithCacheBust(profilePicture)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Failed to load profile picture:', profilePicture);
                        console.error('Image error event:', e);
                        setImageLoadError(true);
                        setProcessingError('Failed to load image. Please upload a new photo.');
                      }}
                      onLoad={() => {
                        console.log('Profile picture loaded successfully:', profilePicture);
                        setImageLoadError(false);
                      }}
                    />
                  </>
                ) : (
                  <>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    <span className="text-sm text-gray-400 mt-2">Add Photo</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!profilePicture && !isProcessingImage && (
              <div className="space-y-2 w-full max-w-xs">
                <Button
                  variant="secondary"
                  onClick={() => setShowCamera(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <span>Take Photo</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleGalleryClick}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <span>Upload Photo</span>
                </Button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 underline"
                >
                  <span>Skip for now</span>
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Photo must show face, ears, and shoulders. You can also add it later from your profile.
                </p>
              </div>
            )}

            {/* Change Photo Options */}
            {profilePicture && !isProcessingImage && (
              <div className="space-y-2 w-full max-w-xs mt-3">
                <p className="text-xs text-gray-300 text-center mb-2">Want to use a different photo?</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setProfilePicture(null);
                    setProcessingError(null);
                    setShowCamera(true);
                  }}
                  className="w-full flex items-center justify-center gap-2"
                  size="sm"
                >
                  <span>Take Another Photo</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setProfilePicture(null);
                    setProcessingError(null);
                    handleGalleryClick();
                  }}
                  className="w-full flex items-center justi fy-center gap-2"
                  size="sm"
                >
                  <span>Upload Another Photo</span>
                </Button>
              </div>
            )}

            {/* Validation Error */}
            {processingError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-xs w-full">
                <p className="text-sm text-red-400 text-center">{processingError}</p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  Please ensure photo includes face, ears, and shoulders
                </p>
              </div>
            )}

            {/* Success Message */}
            {profilePicture && !isProcessingImage && !processingError && (
              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg max-w-xs w-full">
                <p className="text-sm text-green-400 text-center">
                  ✓ Photo validated successfully
                </p>
              </div>
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
          disabled={!selectedGender || isProcessingImage}
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
} 