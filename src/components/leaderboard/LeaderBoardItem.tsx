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
                ${isUser && floating ? 'bg-[#00CC6661] border border-[#00CC6661]' : ''}
                ${isUser && isVisible ? 'scale-102 shadow-lg' : ''}
            `}
            style={{ width: '100%', boxSizing: 'border-box' }}
        >
            {/* Fixed width for rank to prevent alignment issues */}
            <div
                className={`flex-none text-left text-sm overflow-hidden ${isUser ? 'text-[#00CC66] font-bold' : 'text-gray-400'}`}
                style={{ width: '32px', minWidth: '32px', maxWidth: '32px' }}
            >
                {item.rank}
            </div>

            {/* Flexible middle section for avatar and name */}
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

            {/* Fixed width for score, right-aligned */}
            <div
                className={`flex-none text-right text-md overflow-hidden ${isUser ? 'text-[#00CC66] font-bold' : 'text-gray-400'}`}
                style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }}
            >
                {item.score} {item?.suffix ?? ''}
            </div>
        </div>
    );
}