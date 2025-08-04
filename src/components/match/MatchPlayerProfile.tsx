"use client";

import { ProfilePicture } from "../profile/ProfilePicture";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils/styles";

const MatchPlayerProfile = ({ matchStats }: { matchStats: any }) => {
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData(['user']) as User;
    console.log("matchStatsmatchStats", matchStats);

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
                <div className="flex flex-col items-center justify-start">
                    <div className="text-3xl text-[#FFA726] font-bold"> {matchStats?.totalGoal ?? "-"}  </div>
                    <div className="text-lg text-[#FFA726] font-bold"> Goals </div>
                </div>
                <div className="flex flex-col items-center justify-start">
                    <div className="text-3xl text-[#FFA726] font-bold"> {matchStats?.totalAssist ?? "-"} </div>
                    <div className="text-lg text-[#FFA726] font-bold"> Assists </div>
                </div>
            </div>
            <div className="flex flex-row align-center justify-between" style={{
                display: 'flex',
                justifyContent: 'center',
            }}>
                {/* <div className="flex flex-col items-center justify-start">
                    <div className="text-3xl text-[#FFA726] font-bold"> 2 </div>
                    <div className="text-lg text-[#FFA726] font-bold"> Goals </div>
                </div> */}

                <div className="relative">
                    <ProfilePicture imageUrl={user?.profilePicture || undefined} size="xl" userName={user?.firstName + " " + user?.lastName} />
                </div>
                {/* <div className="flex flex-col items-center justify-start">
                    <div className="text-3xl text-[#FFA726] font-bold"> - </div>
                    <div className="text-lg text-[#FFA726] font-bold"> Assists </div>
                </div> */}
            </div>
            <div className={"flex flex-col items-center "} style={{
                marginTop: '-65px',
                position: 'relative',
                zIndex: 100,
            }}>
                <div className={cn("text-4xl font-bold", !user?.profilePicture ? "text-yellow-500" : "text-white")}>{user?.firstName}</div>
                <div className={"text-4xl font-bold text-[#AAAAAA]"}> {user?.lastName}</div>
            </div>
        </div>);
};

export default MatchPlayerProfile;