'use client';

import { useState, useEffect } from 'react';
import { PlayerStatCard } from './PlayerStatCard';
import { PlayerDetailsDrawer } from './PlayerDetailsDrawer';
import { UserData } from '@/modules/onboarding/types';

interface PlayerData {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    statVal: string;
    profilePicture: string | null;
    mvp: boolean;
}

interface PlayerStatCardWithDrawerProps {
    player: PlayerData;
    userData?: UserData;
    matchId?: number;
    onDrawerOpen?: () => void;
    onDrawerClose?: () => void;
    // New props for navigation
    allPlayers?: PlayerData[];
    playerIndex?: number;
}

export const PlayerStatCardWithDrawer = ({
    player,
    userData,
    matchId,
    onDrawerOpen,
    onDrawerClose,
    allPlayers = [],
    playerIndex = 0
}: PlayerStatCardWithDrawerProps) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(playerIndex);

    // Update current player when props change
    useEffect(() => {
        setCurrentPlayerIndex(playerIndex);
    }, [playerIndex]);

    const handleCardClick = () => {
        setCurrentPlayerIndex(playerIndex); // Reset to clicked player
        setIsDrawerOpen(true);
        onDrawerOpen?.();
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        onDrawerClose?.();
    };

    const handlePlayerChange = (newIndex: number) => {
        setCurrentPlayerIndex(newIndex);
    };

    // Get current player based on index
    const currentPlayer = allPlayers[currentPlayerIndex] || player;

    useEffect(() => {
        console.log('isDrawerOpen', isDrawerOpen);
    }, [isDrawerOpen]);

    return (
        <>
            <PlayerStatCard
                name={player.firstName + ' ' + player.lastName}
                {...player}
                onClick={handleCardClick}
            />

            <PlayerDetailsDrawer
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                player={{
                    id: currentPlayer.id,
                    firstName: currentPlayer.firstName,
                    lastName: currentPlayer.lastName,
                    position: currentPlayer.position,
                    statVal: currentPlayer.statVal,
                    profilePicture: currentPlayer.profilePicture,
                    mvp: currentPlayer.mvp
                }}
                userData={userData}
                matchId={matchId}
                players={allPlayers}
                currentPlayerIndex={currentPlayerIndex}
                onPlayerChange={handlePlayerChange}
            />
        </>
    );
};
