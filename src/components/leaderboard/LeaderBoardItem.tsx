/*
import Image from "next/image";
import { useState } from "react";

export function LeaderboardItem({
    floating = false,
    item,
    isUser = false,
    isVisible = false
}: {
    floating?: boolean;
    item: any;
    isUser?: boolean;
    isVisible?: boolean;
}) {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const imageSrc = imageError || !item.imageUrl ? "/skeleton.png" : item.imageUrl;

    return (
        <div
            className={`
                flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ease-in-out
                ${isUser && floating ? 'bg-[#00CC6661] border border-[#00CC6661] hover:scale-105 bg-[#0D1F1E]' : ''}
                ${isUser && isVisible ? 'scale-102 shadow-lg' : ''}
            `}
            style={{ width: '100%', boxSizing: 'border-box' }}
        >
            {/* Fixed width for rank to prevent alignment issues }
            <div
                className={`flex-none text-left text-sm overflow-hidden ${isUser ? 'text-[#00CC66] font-bold' : 'text-gray-400'}`}
                style={{ width: '32px', minWidth: '32px', maxWidth: '32px' }}
            >
                {item.rank}
            </div>

            {/* Flexible middle section for avatar and name }
            <div className="flex-1 flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                    <Image
                        src={imageSrc}
                        alt={item.name}
                        width={40}
                        height={40}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        className={`${imageLoading ? 'opacity-50' : 'opacity-100'} rounded-full w-10 h-10 transition-opacity duration-200`}
                    />
                    {imageLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
                    )}
                </div>
                <div className={`text-lg truncate ${isUser ? 'text-[#00CC66] font-bold' : 'text-white'}`}>
                    {item.name}
                </div>
            </div>

            {/* Fixed width for score, right-aligned }
            <div
                className={`flex-none text-right text-md overflow-hidden ${isUser ? 'text-[#00CC66] font-bold' : 'text-gray-400'}`}
                style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }}
            >
                {item.score} {item?.suffix ?? ''}
            </div>
        </div>
    );
}

*/

import Image from "next/image";
import { useState } from "react";

export function LeaderboardItem({
  floating = false,
  item,
  isUser = false,
  isVisible = false,
  rankChange = 0,
}: {
  floating?: boolean;
  item: any;
  isUser?: boolean;
  isVisible?: boolean;
  rankChange?: number;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const imageSrc =
    imageError || !item.imageUrl ? "/skeleton.png" : item.imageUrl;

  return (
    <div
      className={`
                relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 overflow-hidden
                ${
                  isUser
                    ? "bg-[#00CC66]/10 border-2 border-[#00CC66] hover:scale-[1.02] shadow-xl ring-2 ring-[#00CC66]/50"
                    : "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 shadow-lg"
                }
                ${isUser && isVisible ? "scale-[1.02] shadow-xl" : ""}
            `}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none">
        <span
          className={`text-[110px] font-black font-serif leading-none ${
            isUser ? "text-[#00CC66]/20" : "text-gray-600/50"
          }`}
        >
          {item.rank}
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-4 ml-16">
          <div className="relative w-16 h-16 flex-shrink-0">
            <div
              className={`
            w-full h-full rounded-xl overflow-hidden
            ${
              isUser
                ? "ring-2 ring-[#00CC66] shadow-[0_0_20px_rgba(0,204,102,0.6)]"
                : "ring-1 ring-gray-600"
            }
        `}
            >
              <div
                className={`
                w-full h-full p-0.5
                ${
                  isUser
                    ? "bg-gradient-to-br from-[#00CC66] to-[#00AA55]"
                    : "bg-gradient-to-br from-gray-500 to-gray-700"
                }
            `}
              >
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
                  <Image
                    src={imageSrc}
                    alt={item.name}
                    width={64}
                    height={64}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className={`${
                      imageLoading ? "opacity-50" : "opacity-100"
                    } w-full h-full object-cover`}
                    quality={95}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span
              className={`
                            font-semibold text-base truncate
                            ${isUser ? "text-[#00CC66]" : "text-white"}
                        `}
            >
              {item.name}
            </span>

            {rankChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  rankChange > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                <span>{rankChange > 0 ? "▲" : "▼"}</span>
                <span>{Math.abs(rankChange)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <span
            className={`text-lg ${
              isUser ? "text-[#00CC66]" : "text-purple-400"
            }`}
          >
            ✦
          </span>
          <span
            className={`
                        font-semibold text-base
                        ${isUser ? "text-[#00CC66]" : "text-white"}
                    `}
          >
            {item.score} XP
          </span>
        </div>
      </div>
    </div>
  );
}
