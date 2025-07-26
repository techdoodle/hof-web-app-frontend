import { OnbaordingNavigationProvider } from '@/lib/ui/context/OnbaordingNavigationContext';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface OnboardingContainerProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  progress?: number;
  showSkip?: boolean;
  onSkip?: () => void;
  title?: string;
  fullBleed?: boolean; // <-- add this
}

export function OnboardingContainer({
  children,
  showBackButton,
  onBack,
  progress = 0,
  showSkip,
  onSkip,
  title,
  fullBleed = false, // <-- default false
}: OnboardingContainerProps) {

  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData(['user']);
  const isHomePage = usePathname() === '/';

  return (
    <OnbaordingNavigationProvider>
      <div className="fixed inset-0 h-full min-h-screen w-full overflow-hidden bg-background">
        {/* Background for all screens except fullBleed (welcome) */}
        {!fullBleed && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(/hof-background.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            aria-hidden="true"
          />
        )}
        {/* Mobile container with max-width for larger screens */}
        <div className={`relative h-full w-full mx-auto flex flex-col ${fullBleed ? '' : 'max-w-md'}`}>
          {/* Header */}
          {!!(showBackButton || (progress && progress > 0)) && (
            <header className="flex items-center gap-2 px-4 py-4">
              <div className="flex items-center gap-2 flex-1">
                {(showBackButton) && (
                  <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-foreground/10 focus:outline-none flex-shrink-0"
                    aria-label="Go back"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                  </button>
                )}
                {progress !== undefined && progress > 0 && (
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFA726]" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            </header>
          )}
          {/* Content */}
          <main className={`flex-1 flex flex-col safe-bottom ${fullBleed ? '' : isHomePage ? 'px-0 pb-0' : 'px-4 pb-0'}`}>
            {children}
          </main>
        </div>
      </div>
    </OnbaordingNavigationProvider>
  );
} 