'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/lib/ui/components/Button/Button';

interface SelfieConfirmationPageProps {
    imageUrl: string;
    onConfirm: () => Promise<void>;
    onRetake: () => void;
    onBack: () => void;
    isUploading: boolean;
}

export function SelfieConfirmationPage({
    imageUrl,
    onConfirm,
    onRetake,
    onBack,
    isUploading
}: SelfieConfirmationPageProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col" style={{
            backgroundImage: 'url(/hof-background.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            {/* Mobile container with max-width for larger screens */}
            <div className="relative h-full w-full mx-auto flex flex-col max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-4 pt-12">
                    <button
                        onClick={onBack}
                        disabled={isUploading}
                        className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 pb-6 flex flex-col">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            How does this look?
                        </h1>
                        <p className="text-white/70">
                            This will be processed further for your profile picture
                        </p>
                    </div>

                    {/* Image Preview */}
                    <div className="flex-1 flex items-center justify-center mb-8">
                        <div className="w-64 h-64 rounded-full border-4 border-primary/30 p-2 bg-white/5 backdrop-blur-sm">
                            <img
                                src={imageUrl}
                                alt="Captured selfie preview"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            variant="gradient"
                            onClick={onConfirm}
                            isLoading={isUploading}
                            disabled={isUploading}
                            className="w-full py-4 text-lg font-semibold"
                        >
                            {isUploading ? 'Uploading...' : 'Use This Photo'}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={onRetake}
                            disabled={isUploading}
                            className="w-full py-4 text-lg font-semibold"
                        >
                            Take Another Photo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
