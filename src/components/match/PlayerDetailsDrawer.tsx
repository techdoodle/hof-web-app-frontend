import { BottomDrawer } from '../common/BottomDrawer';
import { MiniMatchCard } from './MiniMatchCard';
import { UserData } from '@/modules/onboarding/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PlayerDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    player: {
        id: number;
        firstName: string;
        lastName: string;
        position: string;
        statVal: string;
        profilePicture: string | null;
        mvp: boolean;
    } | null;
    userData?: UserData;
    matchId?: number;
    // New props for navigation
    players?: Array<{
        id: number;
        firstName: string;
        lastName: string;
        position: string;
        statVal: string;
        profilePicture: string | null;
        mvp: boolean;
    }>;
    currentPlayerIndex?: number;
    onPlayerChange?: (newIndex: number) => void;
}

export const PlayerDetailsDrawer = ({
    isOpen,
    onClose,
    player,
    userData,
    matchId,
    players = [],
    currentPlayerIndex = 0,
    onPlayerChange
}: PlayerDetailsDrawerProps) => {
    const fullName = player?.firstName + ' ' + player?.lastName;

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

    // Determine player position from position string
    const getPlayerPositionFromString = (position: string): 'GK' | 'DEF' | 'FWD' => {
        const upperPos = position.toUpperCase();
        if (upperPos.includes('GOAL') || upperPos === 'GK') return 'GK';
        if (upperPos.includes('DEFEND') || upperPos === 'DEF') return 'DEF';
        if (upperPos.includes('STRIKER') || upperPos === 'FWD') return 'FWD';
        return 'FWD'; // Default fallback
    };

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

                {/* Mini Match Card for Selected Player */}
                {matchId && player?.id && (
                    <MiniMatchCard
                        playerId={player.id}
                        playerName={fullName}
                        playerProfilePicture={player.profilePicture}
                        matchId={matchId}
                        playerPosition={getPlayerPositionFromString(player.position)}
                        mvp={player.mvp}
                    />
                )}
                {players.length > 0 && onPlayerChange && (
                    <div className="flex items-center justify-between p-0">
                        {/* Previous Player Button */}
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
