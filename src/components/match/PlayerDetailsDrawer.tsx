import { BottomDrawer } from '../common/BottomDrawer';
import { MiniMatchCard } from './MiniMatchCard';
import { UserData } from '@/modules/onboarding/types';

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
}

export const PlayerDetailsDrawer = ({ isOpen, onClose, player, userData, matchId }: PlayerDetailsDrawerProps) => {
    const fullName = player?.firstName + ' ' + player?.lastName;

    if (!player) return null;

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
            <div className="drawer-content space-y-6">

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
            </div>
        </BottomDrawer>
    );
};
