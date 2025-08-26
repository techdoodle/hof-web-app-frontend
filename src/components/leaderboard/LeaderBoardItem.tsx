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
        <div className={`
            flex items-center justify-between gap-4 p-3 rounded-xl transition-all duration-500 ease-in-out
            ${isUser && floating ? 'bg-[#00CC6661] border border-[#00CC6661]' : ''}
            ${isUser && isVisible ? 'scale-105 shadow-lg' : ''}
        `}>
            <div className="relative flex-0">
                <div className={`text-sm ${isUser ? 'text-[#00CC66] font-bold' : 'text-gray-400'}`}>
                    {item.rank}
                </div>
            </div>
            <div className="flex-1 flex items-center gap-2">
                <div className="relative">
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
                        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
                    )}
                </div>
                <div className={`text-lg ${isUser ? 'text-[#00CC66] font-bold' : 'text-white'}`}>
                    {item.name}
                </div>
            </div>
            <div className={`flex-0 text-md ${isUser ? 'text-[#00CC66] font-bold' : 'text-gray-400'}`}>
                {item.score} {item?.suffix ?? ''}
            </div>
        </div>
    );
}