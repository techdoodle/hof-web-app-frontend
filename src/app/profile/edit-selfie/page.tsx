'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SelfieInstructionsPage } from '@/components/profile/edit/SelfieInstructionsPage';
import { SelfieCapturePage } from '@/components/profile/edit/SelfieCapturePage';
import { SelfieConfirmationPage } from '@/components/profile/edit/SelfieConfirmationPage';
import { useAuth } from '@/hooks/useAuth';
import { useEditProfile } from '@/hooks/useEditProfile';
import { ImageUploadService } from '@/lib/utils/imageUpload';

function EditSelfieContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { updateProfilePicture } = useEditProfile();
    const [currentStep, setCurrentStep] = useState<'instructions' | 'camera' | 'confirmation'>('instructions');
    const [capturedImageData, setCapturedImageData] = useState<{
        originalImage: string;
        processedImage: string;
        faceBounds: { x: number; y: number; width: number; height: number; };
    } | null>(null);
    const [previousImageData, setPreviousImageData] = useState<{
        originalImage: string;
        processedImage: string;
        faceBounds: { x: number; y: number; width: number; height: number; };
    } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get the return URL from search params
    const returnUrl = searchParams.get('return') || '/profile';

    useEffect(() => {
        // If no user, redirect to profile
        if (!user) {
            router.push('/profile');
        }
    }, [user, router]);

    const handleBack = () => {
        switch (currentStep) {
            case 'confirmation':
                setCurrentStep('camera');
                break;
            case 'camera':
                // If we have previous image data, go back to confirmation
                if (previousImageData) {
                    setCapturedImageData(previousImageData);
                    setPreviousImageData(null);
                    setCurrentStep('confirmation');
                } else {
                    // Otherwise go to instructions
                    setCurrentStep('instructions');
                    setCapturedImageData(null);
                }
                break;
            case 'instructions':
            default:
                router.push(returnUrl);
                break;
        }
    };

    const handleReady = () => {
        setCurrentStep('camera');
    };

    const handleCapture = (originalImage: string, processedImage: string, faceBounds: { x: number; y: number; width: number; height: number; }) => {
        // Clear previous image data when new image is captured
        setPreviousImageData(null);
        setCapturedImageData({ originalImage, processedImage, faceBounds });
        setCurrentStep('confirmation');
    };

    const handleConfirm = async () => {
        if (!capturedImageData) return;

        try {
            setIsUploading(true);

            // Convert the processed image to a File
            const response = await fetch(capturedImageData.processedImage);
            const blob = await response.blob();
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });

            await updateProfilePicture(file);

            // After successful upload, return to profile
            router.push(returnUrl);
        } catch (error) {
            console.error('Failed to update profile picture:', error);
            setIsUploading(false);
            // Could add toast notification here
        }
    };

    const handleRetake = () => {
        // Save current image before going to camera
        if (capturedImageData) {
            setPreviousImageData(capturedImageData);
        }
        setCapturedImageData(null);
        setCurrentStep('camera');
    };

    const handleUploadAnother = () => {
        // Save current image and trigger file picker (stay on confirmation page)
        if (capturedImageData) {
            setPreviousImageData(capturedImageData);
        }
        setUploadError(null);
        handleUploadClick();
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // If no file selected (user cancelled), restore previous image
        if (!file) {
            if (previousImageData) {
                setCapturedImageData(previousImageData);
                setPreviousImageData(null);
            }
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            // Use unified validation and upload service
            const result = await ImageUploadService.validateAndUpload(file, {
                requireValidation: true,
                updateProfile: false
            });

            if (result.success && result.url) {
                // Clear previous image data and set new image
                setPreviousImageData(null);
                setCapturedImageData({
                    originalImage: result.url,
                    processedImage: result.url,
                    faceBounds: { x: 0, y: 0, width: 0, height: 0 }
                });
                setCurrentStep('confirmation');
                setIsUploading(false);
            } else {
                setUploadError(result.error || 'Failed to validate image');
                setIsUploading(false);

                // Restore previous image on error
                if (previousImageData) {
                    setCapturedImageData(previousImageData);
                    setPreviousImageData(null);
                }
            }
        } catch (error) {
            console.error('File upload failed:', error);
            setUploadError('Failed to upload image. Please try again.');
            setIsUploading(false);

            // Restore previous image on error
            if (previousImageData) {
                setCapturedImageData(previousImageData);
                setPreviousImageData(null);
            }
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Show loading if no user data
    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center" style={{
                backgroundImage: 'url(/hof-background.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            {currentStep === 'instructions' && (
                <SelfieInstructionsPage
                    onBack={handleBack}
                    onReady={handleReady}
                    onUpload={handleUploadClick}
                    uploadError={uploadError}
                    isUploading={isUploading}
                />
            )}

            {currentStep === 'camera' && (
                <SelfieCapturePage
                    userData={user}
                    onCapture={handleCapture}
                    onBack={handleBack}
                />
            )}

            {currentStep === 'confirmation' && capturedImageData && (
                <SelfieConfirmationPage
                    imageUrl={capturedImageData.processedImage}
                    onConfirm={handleConfirm}
                    onRetake={handleRetake}
                    onUploadAnother={handleUploadAnother}
                    onBack={handleBack}
                    isUploading={isUploading}
                />
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
            />
        </>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center" style={{
            backgroundImage: 'url(/hof-background.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
}

export default function EditSelfiePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <EditSelfieContent />
        </Suspense>
    );
}
