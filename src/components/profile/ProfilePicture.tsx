'use client';

import { UserIcon } from '@/components/icons';
import { useState, useEffect } from 'react';
interface ProfilePictureProps {
  imageUrl?: string;
  userName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ProfilePicture({
  imageUrl,
  userName,
  size = 'md',
  className = ''
}: ProfilePictureProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-50',
    xl: 'w-50 h-50'
  };
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!imageUrl && imageUrl !== 'undefined');

  // Reset image states when imageUrl changes
  useEffect(() => {
    if (imageUrl && imageUrl !== 'undefined') {
      setImageError(false);
      setImageLoading(true);

      // Fallback timeout in case image load events don't fire
      const timeout = setTimeout(() => {
        setImageLoading(false);
      }, 15000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      setImageLoading(false);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (!imageUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center ${className}`}>
        <img
          src="/skeleton.png"
          alt={userName ? `${userName}` : 'User Skeleton'}
          className="w-full h-auto rounded-lg shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative overflow-hidden ${className}`} style={{ maxWidth: '200px' }}>
      {/* Loading skeleton with animation */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
        </div>
      )}

      <img
        src={imageUrl}
        onLoad={handleImageLoad}
        onError={handleImageError}
        alt={userName}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
        style={{
          maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%',
        }}
        ref={(img) => {
          // Check if image is already loaded (cached)
          if (img && img.complete && img.naturalHeight !== 0) {
            handleImageLoad();
          }
        }}
      />

      {!imageLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-black/60 to-transparent"></div>
      )}
    </div>
  );
} 