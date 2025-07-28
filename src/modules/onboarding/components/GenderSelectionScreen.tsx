import { useState, useEffect } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { GenderSelectionSchema, GenderSelection } from '../types';
import { CameraSelfieModal } from './CameraSelfieModal';
import { OnboardingRepository } from '../repository/onboarding.repository';
import { getAccessToken, getUser } from '@/lib/utils/auth';
import { UserData } from '../types';
import { imageCache } from '@/lib/utils/imageCache';
import { faceExtractor } from '@/lib/utils/faceExtraction';

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
  const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isExtractingFace, setIsExtractingFace] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<string>('');

  const repository = OnboardingRepository.getInstance();

  useEffect(() => {
    if (userData) {
      setSelectedGender(userData.gender as 'MALE' | 'FEMALE' | 'OTHER');
      setProfilePicture(userData.profilePicture);
    }
  }, [userData]);

  // Load cached image on component mount
  useEffect(() => {
    const loadCachedImage = async () => {
      if (userData?.profilePicture) {
        const user = getUser();
        const cached = await imageCache.getCachedImage(userData.profilePicture, user?.id);
        if (cached) {
          const imageToUse = cached.processedUrl || cached.originalUrl;
          
          // Try to extract face from cached image for display
          try {
                         const faceExtractionResult = await faceExtractor.extractFace(imageToUse, 0.08); // Much tighter padding
            
            if (faceExtractionResult.success && faceExtractionResult.faceImageUrl) {
              setProfilePicture(faceExtractionResult.faceImageUrl);
              await extractFacePreview(faceExtractionResult.faceImageUrl);
            } else {
              // Fallback to full cached image
              setProfilePicture(imageToUse);
              await extractFacePreview(cached.originalUrl);
            }
          } catch (error) {
            console.error('Face extraction failed for cached image:', error);
            // Fallback to full cached image
            setProfilePicture(imageToUse);
            await extractFacePreview(cached.originalUrl);
          }
        }
      }
    };
    
    loadCachedImage();
  }, [userData?.profilePicture]);

  const extractFacePreview = async (imageUrl: string) => {
    try {
      setIsExtractingFace(true);
      const result = await faceExtractor.extractFace(imageUrl, 0.2);
      if (result.success && result.faceImageUrl) {
        setFacePreviewUrl(result.faceImageUrl);
      }
    } catch (error) {
      console.error('Face extraction failed:', error);
    } finally {
      setIsExtractingFace(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedGender) {
      setValidationError('Please select your gender');
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

  const handleCameraCapture = async (originalImage: string, processedImage: string, faceBounds: {x: number, y: number, width: number, height: number}) => {
    setShowCamera(false);
    setIsProcessingImage(true);
    setProcessingError(null);

    try {
      const token = getAccessToken();
      const user = getUser();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Use the processed image for better quality face extraction
      const imageToProcess = processedImage || originalImage;
      
      // Cache the original image first
      await imageCache.cacheImage(originalImage, user?.id);
      
      // Extract ONLY the face+ears portion for display
      setExtractionStatus('Extracting face...');
      const faceExtractionResult = await faceExtractor.extractFace(imageToProcess, 0.08); // Much tighter padding
      setExtractionStatus('');
      
      if (faceExtractionResult.success && faceExtractionResult.faceImageUrl) {
        // Display the extracted face+ears only
        setProfilePicture(faceExtractionResult.faceImageUrl);
        
        // Also extract face for preview (smaller version)
        await extractFacePreview(faceExtractionResult.faceImageUrl);
        
        // Send the extracted face image to backend for storage
        const result = await repository.processOnlyProfilePictureBase64(faceExtractionResult.faceImageUrl, token);
        
        // Update cache with the face-only processed URL
        await imageCache.updateProcessedUrl(originalImage, result.url, user?.id);
      } else {
        // Fallback: extract face for preview and use processed image
        await extractFacePreview(imageToProcess);
        
        // Process the full image for backend storage
        const result = await repository.processOnlyProfilePictureBase64(imageToProcess, token);
        setProfilePicture(result.url);
        
        // Update cache with processed URL
        await imageCache.updateProcessedUrl(originalImage, result.url, user?.id);
      }
      
      setIsProcessingImage(false);
    } catch (error) {
      console.error('Image processing failed:', error);
      setProcessingError('Failed to process image. Please try again.');
      setIsProcessingImage(false);
      
      // Fallback: extract face from the best available image
      const fallbackImage = processedImage || originalImage;
      
      // Try to extract face even in fallback scenario
      try {
        setExtractionStatus('Extracting face from fallback...');
        const faceExtractionResult = await faceExtractor.extractFace(fallbackImage, 0.08); // Much tighter padding
        setExtractionStatus('');
        
        if (faceExtractionResult.success && faceExtractionResult.faceImageUrl) {
          // Use the extracted face+ears only
          setProfilePicture(faceExtractionResult.faceImageUrl);
          await extractFacePreview(faceExtractionResult.faceImageUrl);
        } else {
          // If face extraction fails, use full image as last resort
          setProfilePicture(fallbackImage);
          await extractFacePreview(fallbackImage);
        }
              } catch (extractError) {
          console.error('Face extraction failed in fallback:', extractError);
          setExtractionStatus('');
          // Last resort: use the full image
          setProfilePicture(fallbackImage);
          await extractFacePreview(fallbackImage);
        }
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold">
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
                <div className={`w-6 h-6 rounded-full border-2 ${
                  selectedGender === option.value
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
        <h2 className="text-mb mb-2">Click your photo</h2>
        
        <div className="flex flex-col items-center">
          {/* Face Preview Section */}
          {/* {facePreviewUrl && (
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-400 mb-2">Face Preview</p>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 mx-auto">
                <img
                  src={facePreviewUrl}
                  alt="Face preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )} */}

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
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="3"/>
                  </svg>
                  <span className="text-sm text-gray-400">Take Selfie!</span>
                </>
              )}
            </button>

            {/* Face extraction loading indicator */}
            {isExtractingFace && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {processingError && (
            <p className="mt-2 text-sm text-red-500 text-center">{processingError}</p>
          )}
          
          {profilePicture && !isProcessingImage && !extractionStatus && (
            <p className="mt-2 text-xs text-green-500 text-center">
              ✓ Face extracted and processed successfully
            </p>
          )}
          
          {extractionStatus && (
            <p className="mt-2 text-xs text-blue-500 text-center">
              {extractionStatus}
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

      <div className="mt-auto mb-4">
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          size="lg"
          variant="gradient"
          disabled={!selectedGender || isProcessingImage}
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