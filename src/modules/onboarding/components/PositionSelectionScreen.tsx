import { useState } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { PositionSelection, UserData } from '../types';

interface PositionSelectionScreenProps {
  onSubmit: (positionData: PositionSelection) => Promise<void>;
  isLoading: boolean;
  error?: Error | null;
  userData?: UserData;
}

const positions = [
  // { value: 'MIDFIELDER', label: 'Midfielder', icon: '⚡' },
  { value: 'STRIKER', label: 'Striker/Midfielder', icon: '⚡' },
  { value: 'DEFENDER', label: 'Defender', icon: '⚡' },
  { value: 'GOALKEEPER', label: 'Goalkeeper', icon: '⚡' },
  // { value: 'CASUAL', label: 'Casual', icon: '⚡' },
] as const;

export function PositionSelectionScreen({
  onSubmit,
  isLoading,
  error,
  userData,
}: PositionSelectionScreenProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>(
    userData?.playerCategory || ''
  );

  const handleSubmit = async () => {
    if (!selectedPosition) return;

    await onSubmit({
      playerCategory: selectedPosition as PositionSelection['playerCategory'],
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-start overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 text-white font-orbitron">
          What do you usually play?
        </h1>
        <p className="text-gray-400 mb-8">
          Knowing your preferences help us tailor your experience
        </p>

        <div className="space-y-4 mb-8">
          {positions.map((position) => (
            <button
              key={position.value}
              onClick={() => setSelectedPosition(position.value)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedPosition === position.value
                  // ? 'border-primary bg-primary/10 text-primary'
                  ? 'gradient-border-selected'
                  : 'border-gray-700 bg-gray-800/50 text-white hover:border-gray-600'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{position.icon}</span>
                <span className="font-medium">{position.label}</span>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 transition-all ${selectedPosition === position.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-500'
                  }`}
              >
                {selectedPosition === position.value && (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error.message}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedPosition || isLoading}
          isLoading={isLoading}
          variant="gradient"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
} 