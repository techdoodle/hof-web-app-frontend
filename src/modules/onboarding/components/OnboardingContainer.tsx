import { OnbaordingNavigationProvider } from '@/lib/ui/context/OnbaordingNavigationContext';
import { ReactNode } from 'react';

interface OnboardingContainerProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  progress?: number;
  showSkip?: boolean;
  onSkip?: () => void;
  title?: string;
}

export function OnboardingContainer({
  children,
  showBackButton,
  onBack,
  progress = 0,
  showSkip,
  onSkip,
  title,
}: OnboardingContainerProps) {
  return (
    <OnbaordingNavigationProvider>
      <div className="fixed inset-0 h-full min-h-screen w-full overflow-hidden bg-background">
        {/* Mobile container with max-width for larger screens */}
        <div className="relative h-full w-full mx-auto max-w-md flex flex-col">
          {/* Header */}
          {!!(showBackButton || (progress && progress > 0) || showSkip) && (
            <header className="flex items-center gap-2 px-4 py-4 justify-between">
              <div className="flex items-center gap-2">
                {showBackButton && (
                  <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-foreground/10 focus:outline-none"
                    aria-label="Go back"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                  </button>
                )}
                {progress !== undefined && progress > 0 && (
                  <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFA726]" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
              {showSkip && onSkip && (
                <button
                  onClick={onSkip}
                  className="ml-auto px-4 py-1 text-sm font-medium text-primary hover:underline"
                >
                  Skip
                </button>
              )}
            </header>
          )}
          {/* Content */}
          <main className="flex-1 flex flex-col px-4 safe-bottom">
            {children}
          </main>
        </div>
      </div>
    </OnbaordingNavigationProvider>
  );
} 