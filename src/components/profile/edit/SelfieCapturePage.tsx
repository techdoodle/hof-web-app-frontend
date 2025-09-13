'use client';

import { UserData } from '@/modules/onboarding/types';
import { CameraSelfieModal } from '@/modules/onboarding/components/CameraSelfieModal';

interface SelfieCapturePageProps {
    userData: UserData;
    onCapture: (originalImage: string, processedImage: string, faceBounds: { x: number; y: number; width: number; height: number; }) => void;
    onBack: () => void;
}

export function SelfieCapturePage({ userData, onCapture, onBack }: SelfieCapturePageProps) {
    const handleCameraCapture = (originalImage: string, processedImage: string, faceBounds: { x: number; y: number; width: number; height: number; }) => {
        // Pass the captured image data to parent for confirmation
        onCapture(originalImage, processedImage, faceBounds);
    };

    return (
        <div className="fixed inset-0 z-50">
            <CameraSelfieModal
                onCapture={handleCameraCapture}
                onClose={onBack}
            />
        </div>
    );
}
