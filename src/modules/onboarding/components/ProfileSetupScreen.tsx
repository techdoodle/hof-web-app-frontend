import { useState, useRef } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';

interface ProfileSetupScreenProps {
  onSubmit: (file: File) => Promise<{url: string}>;
  isLoading: boolean;
  error?: Error | null;
}

export function ProfileSetupScreen({
  onSubmit,
  isLoading,
  error,
}: ProfileSetupScreenProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      await onSubmit(file);
    } catch (err) {
      // Error will be handled by parent component
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-2">Hello Pranab!</h1>
      <p className="text-gray-600 mb-8">Tell us more about you</p>

      <div className="flex flex-col items-center">
        <div
          className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-6 overflow-hidden"
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
              className="w-12 h-12 text-gray-400"
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={handleCameraClick}
            isLoading={isLoading}
          >
            Take Photo
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error.message}</p>
        )}

        <p className="mt-4 text-sm text-gray-600">
          Want your teammates to recognize you?
        </p>
      </div>

      <div className="mt-auto">
        <Button
          onClick={() => {/* TODO: Skip photo upload */}}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
} 