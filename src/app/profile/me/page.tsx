'use client';

import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { EditProfileContainer } from '@/components/profile/edit/EditProfileContainer';
import { UserData } from '@/modules/onboarding/types';

export default function EditProfilePage() {
    return (
        <AuthWrapper>
            {(userData: UserData) => (
                <EditProfileContainer userData={userData} />
            )}
        </AuthWrapper>
    );
}
