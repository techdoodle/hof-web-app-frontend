import { BottomDrawer } from '../common/BottomDrawer';
import { MiniPlayerCard } from './MiniPlayerCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PlayerOverallDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    player: {
        id: number;
        name: string;
        imageUrl: string | null;
        position?: string;
    } | null;
    // Optional props for navigation between players
    players?: Array<{
        id: number;
        name: string;
        imageUrl: string | null;
        position?: string;
    }>;
    currentPlayerIndex?: number;
    onPlayerChange?: (newIndex: number) => void;
}

export const PlayerOverallDetailsDrawer = ({
    isOpen,
    onClose,
    player,
    players = [],
    currentPlayerIndex = 0,
    onPlayerChange
}: PlayerOverallDetailsDrawerProps) => {
    if (!player) return null;

    // Navigation handlers
    const canGoBack = currentPlayerIndex > 0;
    const canGoNext = currentPlayerIndex < players.length - 1;

    const handlePrevious = () => {
        if (canGoBack && onPlayerChange) {
            onPlayerChange(currentPlayerIndex - 1);
        }
    };

    const handleNext = () => {
        if (canGoNext && onPlayerChange) {
            onPlayerChange(currentPlayerIndex + 1);
        }
    };

    // Get current player based on index
    const currentPlayer = players[currentPlayerIndex] || player;

    return (
        <BottomDrawer isOpen={isOpen} onClose={onClose} height="half">
            <div className="drawer-content space-y-6 flex flex-row justify-center items-center">
                {/* Navigation Header */}
                {players.length > 0 && onPlayerChange && (
                    <div className="flex items-center justify-between p-0">
                        {/* Previous Player Button */}
                        <button
                            onClick={handlePrevious}
                            disabled={!canGoBack}
                            className={`p-2 rounded-full transition-all duration-200 ${canGoBack
                                ? 'text-white hover:bg-white/10 active:scale-95'
                                : 'text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                )}

                {/* Mini Player Card for Selected Player */}
                {currentPlayer?.id && (
                    <MiniPlayerCard
                        playerId={currentPlayer.id}
                        playerName={currentPlayer.name}
                        playerProfilePicture={currentPlayer.imageUrl}
                        playerPosition={currentPlayer.position}
                    />
                )}

                {players.length > 0 && onPlayerChange && (
                    <div className="flex items-center justify-between p-0">
                        {/* Next Player Button */}
                        <button
                            onClick={handleNext}
                            disabled={!canGoNext}
                            className={`p-2 rounded-full transition-all duration-200 ${canGoNext
                                ? 'text-white hover:bg-white/10 active:scale-95'
                                : 'text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </BottomDrawer>
    );
};

