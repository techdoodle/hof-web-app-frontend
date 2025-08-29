import Image from "next/image";
import { useState } from "react";

export const PodiumFrame = ({ category, img, name, score, rank, inverse }: { category?: 'gold' | 'silver' | 'bronze', img: string, name: string, score: string | number, rank: number, inverse?: boolean }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const imageSrc = imageError || !img ? "/skeleton.png" : img;

    const categoryMapClass = {
        gold: 'gold-border',
        silver: 'silver-border',
        bronze: 'bronze-border',
    }
    const sizeClass = {
        gold: 'w-28 h-28',
        silver: 'w-20 h-20',
        bronze: 'w-20 h-20',
    }

    if (!inverse) {
        inverse = category === 'gold' ? false : true;
    }

    return (
        <div className={`flex flex-col items-center justify-center ${inverse ? 'flex-col-reverse' : 'flex-col'}`}>
            <div className="flex flex-col items-center justify-center">
                <div className={`relative rounded-full ${categoryMapClass[category ?? 'gold']}`}>
                    <Image
                        src={imageSrc}
                        alt={`${category} Position`}
                        width={112}
                        height={112}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        className={`${imageLoading ? 'opacity-50' : 'opacity-100'} bg-black rounded-full w-10 h-10 transition-opacity duration-200 ${sizeClass[category ?? 'gold']}`}
                    />
                </div>
                <div className={`text-white text-md rounded-full w-8 h-8 flex items-center justify-center mt-[-20px] z-10 ${categoryMapClass[category ?? 'gold']}`}>{rank}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="text-white text-md truncate max-w-[15ch]">{name}</div>
                <div className="text-gray-400 text-sm">{score}</div>
            </div>
        </div>

    );
}