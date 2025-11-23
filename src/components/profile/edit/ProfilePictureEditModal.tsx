'use client';

import { useState, useRef } from 'react';
import { UserData } from '@/modules/onboarding/types';
import { Button } from '@/lib/ui/components/Button/Button';
import { CameraSelfieModal } from '@/modules/onboarding/components/CameraSelfieModal';
import { ImageUploadService } from '@/lib/utils/imageUpload';

interface ProfilePictureEditModalProps {
    userData: UserData;
    onClose: () => void;
    onUpdateProfilePicture: (file: File) => Promise<{ url: string }>;
    isLoading: boolean;
}

export function ProfilePictureEditModal({
    userData,
    onClose,
    onUpdateProfilePicture,
    isLoading
}: ProfilePictureEditModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsValidating(true);
        setValidationError(null);

        try {
            // Validate the uploaded file
            const result = await ImageUploadService.validateAndUpload(file, {
                requireValidation: true,
                updateProfile: false // We'll handle the upload separately
            });

            if (result.success && result.url) {
                // Convert the processed image back to a file
                const response = await fetch(result.url);
                const blob = await response.blob();
                const processedFile = new File([blob], file.name, { type: 'image/jpeg' });

                setSelectedFile(processedFile);
                setPreviewUrl(result.url);
                setIsValidating(false);
            } else {
                setValidationError(result.error || 'Validation failed');
                setIsValidating(false);
            }
        } catch (error) {
            console.error('File validation failed:', error);
            setValidationError('Failed to validate image. Please try again.');
            setIsValidating(false);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCameraClick = () => {
        setShowCamera(true);
    };

    const handleCameraCapture = (originalImage: string, processedImage: string, faceBounds: { x: number; y: number; width: number; height: number; }) => {
        // Use the processed image for the profile picture
        fetch(processedImage)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                setSelectedFile(file);
                setPreviewUrl(processedImage);
                setShowCamera(false);
            })
            .catch(err => {
                console.error('Failed to process camera capture:', err);
                setShowCamera(false);
            });
    };

    const handleGalleryClick = () => {
        fileInputRef.current?.click();
    };

    const handleApprove = async () => {
        if (!selectedFile) return;

        try {
            await onUpdateProfilePicture(selectedFile);
            onClose();
        } catch (error) {
            console.error('Failed to update profile picture:', error);
        }
    };

    const handleCancel = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-background rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
                {showCamera ? (
                    <CameraSelfieModal
                        onCapture={handleCameraCapture}
                        onClose={() => setShowCamera(false)}
                    />
                ) : (
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white mb-6 text-center">
                            Update Profile Picture
                        </h2>

                        {/* Preview Section */}
                        {previewUrl ? (
                            <div className="flex flex-col items-center mb-6 animate-fade-in">
                                <div
                                    className="w-32 h-32 rounded-full bg-cover bg-center border-2 border-primary/20 mb-4 transition-all duration-300 hover:scale-105"
                                    style={{
                                        backgroundImage: `url(${previewUrl})`,
                                    }}
                                />
                                <p className="text-gray-400 text-sm animate-slide-up">Preview</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center mb-6 animate-fade-in">
                                <div
                                    className="w-32 h-32 rounded-full bg-cover bg-center border-2 border-gray-600 mb-4 transition-all duration-300 hover:scale-105"
                                    style={{
                                        backgroundImage: userData.profilePicture
                                            ? `url(${userData.profilePicture})`
                                            : 'url(/skeleton.png)',
                                    }}
                                />
                                <p className="text-gray-400 text-sm animate-slide-up">Current Picture</p>
                            </div>
                        )}

                        {/* Validation Error */}
                        {validationError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
                                <p className="text-sm text-red-400 text-center">{validationError}</p>
                                <p className="text-xs text-gray-400 text-center mt-1">
                                    Please ensure photo includes face, ears, and shoulders
                                </p>
                            </div>
                        )}

                        {/* Validating Indicator */}
                        {isValidating && (
                            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg animate-fade-in">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                                    <p className="text-sm text-blue-400">Validating image...</p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {!previewUrl ? (
                            <div className="space-y-3 mb-6 animate-slide-up">
                                <Button
                                    variant="secondary"
                                    onClick={handleCameraClick}
                                    disabled={isValidating}
                                    className="w-full transform transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    Take Photo
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleGalleryClick}
                                    disabled={isValidating}
                                    isLoading={isValidating}
                                    className="w-full transform transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    🖼️ Choose from Gallery
                                </Button>
                                <p className="text-xs text-gray-400 text-center">
                                    Accepted formats: JPEG, JPG, PNG
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-6 animate-slide-up">
                                <Button
                                    variant="gradient"
                                    onClick={handleApprove}
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                    className="w-full transform transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    Save Changes
                                </Button>

                                {/* Retake Options */}
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-400 text-center">Want to use a different photo?</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setPreviewUrl(null);
                                                setSelectedFile(null);
                                                setValidationError(null);
                                                handleCameraClick();
                                            }}
                                            className="flex-1 transform hover:scale-105 active:scale-95"
                                        >
                                            Take Photo
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setPreviewUrl(null);
                                                setSelectedFile(null);
                                                setValidationError(null);
                                                handleGalleryClick();
                                            }}
                                            className="flex-1 transform hover:scale-105 active:scale-95"
                                        >
                                            Upload Photo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cancel Button */}
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                            className="w-full transform transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Cancel
                        </Button>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
