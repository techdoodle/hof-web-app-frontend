'use client';

import { useState } from 'react';
import { EditFormField } from './EditFormField';
import { EditNameForm } from './EditNameForm';
import { EditGenderForm } from './EditGenderForm';
import { EditPositionForm } from './EditPositionForm';
import { EditTeamForm } from './EditTeamForm';
import { UserData } from '@/modules/onboarding/types';

interface EditProfileFormProps {
    userData: UserData;
    onUpdateField: (field: string, value: any) => Promise<void>;
    isLoading: boolean;
}

export function EditProfileForm({ userData, onUpdateField, isLoading }: EditProfileFormProps) {
    const [editingField, setEditingField] = useState<string | null>(null);

    const handleEditField = (fieldName: string) => {
        setEditingField(fieldName);
    };

    const handleSaveField = async (field: string, value: any) => {
        try {
            await onUpdateField(field, value);
            setEditingField(null);
        } catch (error) {
            console.error('Failed to update field:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingField(null);
    };

    console.log("userData editProfileForm", userData);

    return (
        <div className="flex-1 px-4 pb-6 animate-fade-in">
            <div className="space-y-4">
                {/* Name & City */}
                <EditFormField
                    label="Name & City"
                    value={`${userData.firstName} ${userData.lastName}, ${userData.city?.cityName || 'No city'}`}
                    onEdit={() => handleEditField('name')}
                    isEditing={editingField === 'name'}
                    renderEditForm={() => (
                        <EditNameForm
                            userData={userData}
                            onSave={(data: any) => handleSaveField('userInfo', data)}
                            onCancel={handleCancelEdit}
                            isLoading={isLoading}
                        />
                    )}
                />

                {/* Gender */}
                <EditFormField
                    label="Gender"
                    value={userData.gender || 'Not specified'}
                    onEdit={() => handleEditField('gender')}
                    isEditing={editingField === 'gender'}
                    renderEditForm={() => (
                        <EditGenderForm
                            userData={userData}
                            onSave={(data: string) => handleSaveField('gender', data)}
                            onCancel={handleCancelEdit}
                            isLoading={isLoading}
                        />
                    )}
                />

                {/* Position */}
                <EditFormField
                    label="Your Role"
                    value={userData.playerCategory || 'Not specified'}
                    onEdit={() => handleEditField('position')}
                    isEditing={editingField === 'position'}
                    renderEditForm={() => (
                        <EditPositionForm
                            userData={userData}
                            onSave={(data: string) => handleSaveField('position', data)}
                            onCancel={handleCancelEdit}
                            isLoading={isLoading}
                        />
                    )}
                />

                {/* Team */}
                <EditFormField
                    label="Favourite Team"
                    value={userData.preferredTeam?.teamName || 'Not specified'}
                    onEdit={() => handleEditField('team')}
                    isEditing={editingField === 'team'}
                    renderEditForm={() => (
                        <EditTeamForm
                            userData={userData}
                            onSave={(data: number) => handleSaveField('preferredTeam', data)}
                            onCancel={handleCancelEdit}
                            isLoading={isLoading}
                        />
                    )}
                />
            </div>
        </div>
    );
}
