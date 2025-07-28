import { UserIcon } from '@/components/icons';

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
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-50'
  };

  if (!imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gray-700 flex items-center justify-center ${className}`}>
        <UserIcon className="w-1/2 h-1/2 text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative overflow-hidden ${className}`}>
      <img
        src={imageUrl}
        alt={userName}
        className="w-full h-full object-cover"
        style={{
          maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%'
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
  );
} 