/*
import { PodiumFrame } from "../common/PodiumFrame";

export const Podium = (props: { first: any, second: any, third: any }) => {
    return (
        <div className="flex flex-row gap-4 justify-center items-end min-h-[220px]">
            <div className="w-1/4 flex flex-col items-center justify-end">
                <PodiumFrame category="silver" img={props.second.imageUrl ?? "/skeleton.png"} name={props.second.name ?? "User"} score={props.second.score} rank={2} inverse={true} />
            </div>
            <div className="w-1/2 flex flex-col items-center justify-start">
                <PodiumFrame category="gold" img={props.first.imageUrl ?? "/skeleton.png"} name={props.first.name ?? "User"} score={props.first.score} rank={1} inverse={false} />
            </div>
            <div className="w-1/4 flex flex-col items-center justify-end">
                <PodiumFrame category="bronze" img={props.third.imageUrl ?? "/skeleton.png"} name={props.third.name ?? "User"} score={props.third.score} rank={3} inverse={true} />
            </div>
        </div>
    );
}
*/

import React, { useState } from "react";
import Image from "next/image";

const PodiumImage = ({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const imageSrc = imageError || !src ? "/skeleton.png" : src;

  return (
    <div className="w-full h-full rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden">
      <Image
        src={imageSrc}
        alt={alt}
        width={size * 4}
        height={size * 4}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => setImageLoading(false)}
        className={`${
          imageLoading ? "opacity-50" : "opacity-100"
        } w-full h-full object-cover transition-opacity duration-200`}
      />
    </div>
  );
};

export const Podium = (props: { first: any; second: any; third: any }) => {
  const leaderboardData = [
    {
      rank: 2,
      name: props.second?.name ?? "User",
      score: props.second?.score ?? 0,
      imageUrl: props.second?.imageUrl ?? "/skeleton.png",
      category: "silver" as const,
    },
    {
      rank: 1,
      name: props.first?.name ?? "User",
      score: props.first?.score ?? 0,
      imageUrl: props.first?.imageUrl ?? "/skeleton.png",
      category: "gold" as const,
    },
    {
      rank: 3,
      name: props.third?.name ?? "User",
      score: props.third?.score ?? 0,
      imageUrl: props.third?.imageUrl ?? "/skeleton.png",
      category: "bronze" as const,
    },
  ];

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return "h-36";
      case 2:
        return "h-28";
      case 3:
        return "h-20";
      default:
        return "h-20";
    }
  };

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-gray-400/50 to-gray-500/30";
      case 2:
        return "from-gray-400/50 to-gray-500/30";
      case 3:
        return "from-gray-400/50 to-gray-500/30";
      default:
        return "from-gray-500/30 to-gray-600/20";
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900";
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900";
      case 3:
        return "bg-gradient-to-br from-orange-500 to-orange-700 text-orange-100";
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-600 text-gray-100";
    }
  };

  const getAvatarBorderColor = (category: "gold" | "silver" | "bronze") => {
    switch (category) {
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "silver":
        return "from-gray-300 to-gray-500";
      case "bronze":
        return "from-orange-500 to-orange-700";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex items-end justify-center">
        {leaderboardData.map((player) => (
          <div
            key={player.rank}
            className="flex flex-col items-center relative flex-1"
            style={{
              order: player.rank === 1 ? 2 : player.rank === 2 ? 1 : 3,
              maxWidth: "110px",
            }}
          >
            <div className="relative mb-2 transform hover:scale-110 transition-transform duration-300">
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${getRankBadgeColor(
                  player.rank
                )} flex items-center justify-center font-bold text-xs shadow-lg z-10 border-2 border-white`}
              >
                {player.rank}
              </div>

              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarBorderColor(
                  player.category
                )} p-0.5 shadow-xl`}
              >
                <PodiumImage
                  src={player.imageUrl}
                  alt={player.name}
                  size={14}
                />
              </div>
            </div>

            <div className="text-white font-bold text-sm mb-1 text-center truncate w-full px-1">
              {player.name}
            </div>

            <div className="flex items-center gap-0.5 mb-2">
              <span className="text-purple-300 text-sm">✦</span>
              <span className="text-white font-semibold text-base">
                {player.score}
              </span>
            </div>

            <div
              className={`w-full ${getPodiumHeight(
                player.rank
              )} relative perspective-1000`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-t ${getPodiumColor(
                  player.rank
                )} backdrop-blur-sm border border-white/20 rounded-t-lg overflow-hidden shadow-2xl`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-grey-500/30 font-bold text-7xl pt-3">
                    {player.rank}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              </div>

              <div
                className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-br ${getPodiumColor(
                  player.rank
                )} border-t border-l border-r border-white/10 rounded-t-lg`}
                style={{
                  transform: "perspective(400px) rotateX(85deg)",
                  transformOrigin: "bottom",
                  filter: "brightness(1.3)",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
