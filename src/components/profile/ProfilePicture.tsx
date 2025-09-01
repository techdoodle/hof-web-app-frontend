'use client';

import { UserIcon } from '@/components/icons';
import { useState } from 'react';
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
    <div className={`${sizeClasses[size]}  relative overflow-hidden ${className}`} style={{ maxWidth: '200px' }}>
      <img
        src={imageUrl}
        onError={() => setImageError(true)}
        alt={userName}
        className="w-full h-full object-cover"
        style={{
          maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%',

        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
  );
} 