"use client";

import { ProfilePicture } from "../profile/ProfilePicture";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils/styles";

const MatchPlayerProfile = () => {
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData(['user']) as User;
    console.log("user", user);

    return (
        <div className="match-player-profile relative">
            <div className="flex flex-row align-center justify-between">
                <div className="flex flex-col items-center justify-start">
                    <div className="text-3xl text-[#FFA726] font-bold"> 2 </div>
                    <div className="text-lg text-[#FFA726] font-bold"> Goals </div>
                </div>

                <div className="relative">
                    <ProfilePicture imageUrl={user?.profilePicture || undefined} size="xl" userName={user?.firstName + " " + user?.lastName} />
                </div>
                <div className="flex flex-col items-center justify-start">
                    <div className="text-3xl text-[#FFA726] font-bold"> - </div>
                    <div className="text-lg text-[#FFA726] font-bold"> Assists </div>
                </div>
            </div>
            <div className={"flex flex-col items-center justify-start absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/20"}>
                <div className={cn("text-4xl font-bold", !user?.profilePicture ? "text-yellow-500" : "text-white")}>{user?.firstName}</div>
                <div className={"text-4xl font-bold text-[#AAAAAA]"}> {user?.lastName}</div>
            </div>
        </div>);
};

export default MatchPlayerProfile;