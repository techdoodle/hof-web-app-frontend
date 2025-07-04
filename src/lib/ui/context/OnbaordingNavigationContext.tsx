import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OnbaordingNavigationContextProps {
  showBackButton: boolean;
  setShowBackButton: (show: boolean) => void;
  onBack: (() => void) | null;
  setOnBack: (handler: (() => void) | null) => void;
  progress: number | null;
  setProgress: (progress: number | null) => void;
}

const OnbaordingNavigationContext = createContext<OnbaordingNavigationContextProps | undefined>(undefined);

export const OnbaordingNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [showBackButton, setShowBackButton] = useState(false);
  const [onBack, setOnBack] = useState<(() => void) | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const contextValue = React.useMemo(
    () => ({ showBackButton, setShowBackButton, onBack, setOnBack, progress, setProgress }),
    [showBackButton, onBack, progress]
  );

  return (
    <OnbaordingNavigationContext.Provider value={contextValue}>
      {children}
    </OnbaordingNavigationContext.Provider>
  );
};

export function useOnbaordingNavigation() {
  const context = useContext(OnbaordingNavigationContext);
  if (!context) {
    throw new Error('useOnbaordingNavigation must be used within a OnbaordingNavigationProvider');
  }
  return context;
} 