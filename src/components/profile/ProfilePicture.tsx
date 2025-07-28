import { useEffect, useState } from 'react';
import { UserIcon } from '@/components/icons';
import { imageCache } from '@/lib/utils/imageCache';
import { getUser } from '@/lib/utils/auth';
import { faceExtractor } from '@/lib/utils/faceExtraction';

interface ProfilePictureProps {
  imageUrl?: string;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfilePicture({ 
  imageUrl, 
  userName,
  size = 'md',
  className = ''
}: ProfilePictureProps) {
  const [processedImage, setProcessedImage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-50'
  };

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const processImage = async () => {
      try {
        const user = getUser();
        // Try to get cached image first
        const cacheKey = `face-extract-${imageUrl}`;
        const cached = await imageCache.getCachedImage(cacheKey, user?.id);
        
        if (cached?.processedUrl) {
          if (isMounted) {
            setProcessedImage(cached.processedUrl);
            setIsLoading(false);
          }
          return;
        }

        console.log('Extracting face from:', imageUrl);
        // Extract face from profile picture with minimal padding to exclude neck
        const faceResult = await faceExtractor.extractFace(imageUrl, 0.05);
        console.log('Face extraction result:', faceResult);

        if (!faceResult.success || !faceResult.faceImageUrl) {
          console.warn('Face extraction failed:', faceResult.error);
          if (isMounted) {
            setProcessedImage(imageUrl);
            setIsLoading(false);
          }
          return;
        }

        // Cache the extracted face
        await imageCache.cacheImage(cacheKey, user?.id, faceResult.faceImageUrl);
        
        if (isMounted) {
          setProcessedImage(faceResult.faceImageUrl);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        if (isMounted) {
          setProcessedImage(imageUrl);
          setIsLoading(false);
        }
      }
    };

    processImage();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  if (!imageUrl || isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gray-700 flex items-center justify-center ${className}`}>
        <UserIcon className="w-1/2 h-1/2 text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]}  relative overflow-hidden ${className}`}>
      <img
        src={processedImage || imageUrl}
        alt={userName}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
  );
} 