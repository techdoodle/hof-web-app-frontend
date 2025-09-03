"use client";

import { ProfilePicture } from "../profile/ProfilePicture";
import { UserData } from "@/modules/onboarding/types";
import { cn } from "@/lib/utils/styles";
import { determineMainStats } from "@/lib/utils/determineMainStats";

const MatchPlayerProfile = ({ matchStats, userData, playerPosition }: { matchStats: any; userData: UserData; playerPosition: 'GK' | 'DEF' | 'FWD' }) => {

    const KEY_STATS = determineMainStats(playerPosition, matchStats);
    return (
        <div className="match-player-profile relative">
            <div style={{
                padding: '0px 20px',
                position: 'relative',
                zIndex: 100,
                marginBottom: '-65px',
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                {Object.entries(KEY_STATS).map(([key, value]) => (
                    <div key={key} className="flex flex-col items-center justify-start">
                        <div className="text-3xl text-[#FFA726] font-bold"> {value} </div>
                        <div className="text-lg text-[#FFA726] font-bold font-orbitron"> {key} </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-row align-center justify-between" style={{
                display: 'flex',
                justifyContent: 'center',
            }}>

                <div className="relative">
                    <ProfilePicture
                        key={`${userData?.id}-${userData?.profilePicture}`}
                        imageUrl={userData?.profilePicture || 'undefined'}
                        size="xl"
                        userName={userData?.firstName + " " + userData?.lastName}
                    />
                </div>
            </div>
            <div className={"flex flex-col items-center text-gradient-bg max-w-full"} style={{
                marginTop: '-65px',
                position: 'relative',
                zIndex: 100,
            }}>
                <div className={cn("text-4xl font-bold font-orbitron", !userData?.profilePicture ? "text-yellow-500" : "text-white")}>{userData?.firstName}</div>
                <div className={"text-4xl font-bold font-orbitron text-[#AAAAAA]"}> {userData?.lastName}</div>
            </div>
        </div>);
};

export default MatchPlayerProfile;