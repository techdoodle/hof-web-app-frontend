'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/lib/ui/components/Button/Button';

interface SelfieInstructionsPageProps {
    onBack: () => void;
    onReady: () => void;
}

export function SelfieInstructionsPage({ onBack, onReady }: SelfieInstructionsPageProps) {
    const instructions = [
        {
            image: '/selfie-instructions/masked.jpg',
            title: 'Remove anything that covers your face.',
            hasError: true
        },
        {
            image: '/selfie-instructions/specs.jpg',
            title: 'Take off your glasses to prevent glare or reflections',
            hasError: true
        },
        {
            image: '/selfie-instructions/dark.jpg',
            title: 'Take your selfie in a well-lit space',
            hasError: true
        },
        {
            image: '/selfie-instructions/sample-selfie.jpg',
            title: 'Perfect selfie example',
            hasError: false
        }
    ];

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
                        className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 pb-6">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Ready to take a selfie?
                        </h1>
                    </div>

                    {/* Main selfie display */}
                    <div className="flex justify-center mb-8">
                        <div className="w-48 h-48 rounded-full border-4 border-primary p-2">
                            <img
                                src="/selfie-instructions/sample-selfie.jpg"
                                alt="Perfect selfie example"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-4 mb-8">
                        {instructions.slice(0, 3).map((instruction, index) => (
                            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={instruction.image}
                                        alt={instruction.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    {instruction.hasError && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">✕</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-white text-sm flex-1">
                                    {instruction.title}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                        <Button
                            variant="gradient"
                            onClick={onReady}
                            className="w-full py-4 text-lg font-semibold"
                        >
                            I'm Ready
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
