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

  const imageSrc =
    imageError || !item.imageUrl ? "/skeleton.png" : item.imageUrl;

  return (
    <div
      className={`
                relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 overflow-hidden
                ${
                  isUser && floating
                    ? "bg-[#00CC6661] border border-[#00CC66] hover:scale-[1.02] shadow-xl"
                    : "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 shadow-lg"
                }
                ${isUser && isVisible ? "scale-[1.02] shadow-xl" : ""}
            `}
    >
      {/* Large background rank number */}
      <div className="absolute -left-2 top-11 -translate-y-1/2 pointer-events-none">
        <span className="text-[120px] font-black text-gray-600/60 leading font-serif">
          {item.rank}
        </span>
      </div>

      {/* Content (on top of background number) */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Left section: Avatar + Name */}
        <div className="flex items-center gap-4 ml-16">
          {/* Avatar with gradient border */}
          <div
            className={`
                        w-12 h-12 rounded-full p-0.5 shadow-lg flex-shrink-0
                        ${
                          isUser
                            ? "bg-gradient-to-br from-[#00CC66] to-[#00AA55]"
                            : "bg-gradient-to-br from-gray-400 to-gray-600"
                        }
                    `}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
              <Image
                src={imageSrc}
                alt={item.name}
                width={48}
                height={48}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className={`${
                  imageLoading ? "opacity-50" : "opacity-100"
                } w-full h-full object-cover transition-opacity duration-200`}
              />
            </div>
          </div>

          {/* Name */}
          <span
            className={`
                        font-semibold text-base truncate
                        ${isUser ? "text-[#00CC66]" : "text-white"}
                    `}
          >
            {item.name}
          </span>
        </div>

        {/* Right section: Score */}
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
            {item.score}
            {item?.suffix ?? ""}
          </span>
        </div>
      </div>
    </div>
  );
}
