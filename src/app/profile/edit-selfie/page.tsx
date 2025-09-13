'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SelfieInstructionsPage } from '@/components/profile/edit/SelfieInstructionsPage';
import { SelfieCapturePage } from '@/components/profile/edit/SelfieCapturePage';
import { SelfieConfirmationPage } from '@/components/profile/edit/SelfieConfirmationPage';
import { useAuth } from '@/hooks/useAuth';
import { useEditProfile } from '@/hooks/useEditProfile';

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
    const [isUploading, setIsUploading] = useState(false);

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
                setCurrentStep('instructions');
                setCapturedImageData(null);
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
        setCapturedImageData(null);
        setCurrentStep('camera');
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
                    onBack={handleBack}
                    isUploading={isUploading}
                />
            )}
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
