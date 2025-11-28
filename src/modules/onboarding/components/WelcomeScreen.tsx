import { Button } from '@/lib/ui/components/Button/Button';
import { ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/landing-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-black opacity-40" />

      {/* Scrollable Content */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 overflow-y-auto pb-20">
        <div className="logo-container">
          <Image src="/logo.svg" alt="Humans of Football Logo" width={100} height={100} />
        </div>

        <h1 className="text-3xl font-bold mb-4 text-white">
          <span>JOIN YOUR</span>
          <br />
          <span>NEAREST</span>
          <br />
          <span>GAME <span className="text-light-green">TODAY</span></span>
        </h1>

        <p className="text-white text-lg">
          Connect with fellow players and find your next match
        </p>
      </div>

      {/* Fixed Continue Button */}
      <div
        className="fixed left-0 right-0 p-4 z-50"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(to top, var(--background) 70%, transparent)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto'
        }}
      >
        <Button
          variant="gradient"
          onClick={onContinue}
          size="lg"
          className="w-full"
          style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
        >
          Get Started <ArrowRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 