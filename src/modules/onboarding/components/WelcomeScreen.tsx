import { Button } from '@/lib/ui/components/Button/Button';
import Image from 'next/image';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="relative h-full w-full flex flex-col">
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
      {/* Main content */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4">
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

      {/* Bottom button */}
      <div className="z-10 w-full p-4 h-100">
        <Button
          variant="gradient"
          onClick={onContinue}
          size="lg"
         >
          Continue
        </Button>
      </div>
    </div>
  );
} 