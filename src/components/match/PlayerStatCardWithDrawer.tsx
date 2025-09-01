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
}

export const PlayerStatCardWithDrawer = ({ player, userData, matchId, onDrawerOpen, onDrawerClose }: PlayerStatCardWithDrawerProps) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleCardClick = () => {
        setIsDrawerOpen(true);
        onDrawerOpen?.();
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        onDrawerClose?.();
    };

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
                    id: player.id,
                    firstName: player.firstName,
                    lastName: player.lastName,
                    position: player.position,
                    statVal: player.statVal,
                    profilePicture: player.profilePicture,
                    mvp: player.mvp
                }}
                userData={userData}
                matchId={matchId}
            />
        </>
    );
};
