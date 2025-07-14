import { useState, useRef, useEffect } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { UserData } from '../types';
import { useRouter } from 'next/navigation';
import { imageCache } from '@/lib/utils/imageCache';
import { faceExtractor } from '@/lib/utils/faceExtraction';
import { getUser } from '@/lib/utils/auth';

interface ProfileSetupScreenProps {
  onSubmit: (file: File) => Promise<{url: string}>;
  onFinish: () => void;
  isLoading: boolean;
  error?: Error | null;
  userData?: UserData;
}

export function ProfileSetupScreen({
  onSubmit,
  onFinish,
  isLoading,
  error,
  userData,
}: ProfileSetupScreenProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(userData?.profilePicture || null);
  const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null);
  const [isExtractingFace, setIsExtractingFace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load cached image on component mount
  useEffect(() => {
    const loadCachedImage = async () => {
      if (userData?.profilePicture) {
        const user = getUser();
        const cached = await imageCache.getCachedImage(userData.profilePicture, user?.id);
        if (cached) {
          setPreviewUrl(cached.processedUrl || cached.originalUrl);
          
          // Extract face for preview
          if (cached.originalUrl) {
            await extractFacePreview(cached.originalUrl);
          }
        } else {
          // Cache the current image
          await imageCache.cacheImage(userData.profilePicture, user?.id);
          await extractFacePreview(userData.profilePicture);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Cache the image
    const user = getUser();
    await imageCache.cacheImage(url, user?.id);

    // Extract face for preview
    await extractFacePreview(url);

    try {
      const result = await onSubmit(file);
      
      // Update cache with processed URL
      if (result?.url) {
        await imageCache.updateProcessedUrl(url, result.url, user?.id);
      }
    } catch (err) {
      // Error will be handled by parent component
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFinish = () => {
    // Navigate to position selection
    onFinish();
  };

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-2">Hello {userData?.firstName}!</h1>
      <p className="text-gray-400 mb-8">Your profile is set up.</p>

      <div className="flex flex-col items-center flex-1 justify-center">
        {/* Face Preview Section */}
        {facePreviewUrl && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-400 mb-2">Face Preview</p>
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 mx-auto">
              <img
                src={facePreviewUrl}
                alt="Face preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Main Profile Picture */}
        <div className="relative">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 overflow-hidden border-2 ${
              previewUrl 
                ? 'border-primary/20' 
                : 'border-gray-600 bg-gray-800/50'
            }`}
            style={
              previewUrl
                ? {
                    backgroundImage: `url(${previewUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            {!previewUrl && (
              <svg
                className="w-12 h-12 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>

          {/* Face extraction loading indicator */}
          {isExtractingFace && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!previewUrl && (
          <Button
            variant="secondary"
            onClick={handleCameraClick}
            isLoading={isLoading}
            className="mb-4"
          >
            Add Profile Picture
          </Button>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">{error.message}</p>
        )}
      </div>

      <div className="mt-auto">
        <Button
          onClick={handleFinish}
          variant="gradient"
          size="lg"
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </div>
  );
} 