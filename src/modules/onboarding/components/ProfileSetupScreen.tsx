import { useState, useRef, useEffect } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { UserData } from '../types';
import { useRouter } from 'next/navigation';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const result = await onSubmit(file);
      
      // Update preview with processed URL
      if (result?.url) {
        setPreviewUrl(result.url);
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