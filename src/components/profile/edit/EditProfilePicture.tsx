'use client';

import { useRouter } from 'next/navigation';
import { UserData } from '@/modules/onboarding/types';
import { ProfilePicture } from '@/components/profile/ProfilePicture';
import { CameraIcon } from 'lucide-react';
import NameComponent from '../NameComponent';

interface EditProfilePictureProps {
    userData: UserData;
    onUpdateProfilePicture: (file: File) => Promise<{ url: string }>;
    isLoading: boolean;
}

export function EditProfilePicture({
    userData,
    onUpdateProfilePicture,
    isLoading
}: EditProfilePictureProps) {
    const router = useRouter();

    const handleEditClick = () => {
        // Navigate to the selfie page with current page as return URL
        router.push('/profile/edit-selfie?return=/profile/me');
    };

    return (
        <>
            <div className="flex flex-col items-center py-8 animate-fade-in">
                <div className="relative group">
                    {/* Profile Picture */}
                    <div className="border-2 border-dotted border-white/20 rounded-full animate-scale-in transition-transform duration-300 group-hover:scale-105 p-2 overflow-hidden">
                        <ProfilePicture
                            key={`profile-pic-${userData.id}-${userData.profilePicture || 'no-image'}`}
                            imageUrl={userData.profilePicture || ''}
                            userName={`${userData.firstName} ${userData.lastName}`}
                            size="md"
                            className="transition-all duration-300 object-cover"
                        />
                    </div>

                    {/* Edit Icon Overlay */}
                    <button
                        onClick={handleEditClick}
                        disabled={isLoading}
                        className="absolute  bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg 
                                 hover:bg-white/90 hover:scale-110 active:scale-95
                                 transition-all duration-200 ease-out
                                 disabled:opacity-50 disabled:hover:scale-100
                                 animate-bounce-in group-hover:animate-pulse"
                    >
                        <CameraIcon className="w-5 h-5 text-black transition-transform duration-200" strokeWidth={2} />
                    </button>

                    {/* Subtle ring animation on hover */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 
                                  animate-pulse transition-opacity duration-300 pointer-events-none" />
                </div>

                <NameComponent firstName={userData.firstName} lastName={userData.lastName} />
            </div>
        </>
    );
}
