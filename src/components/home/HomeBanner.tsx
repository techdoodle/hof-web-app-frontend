'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export function HomeBanner() {
    const router = useRouter();

    return (
        <div className="relative w-full h-[400px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/hof-home-banner.png"
                    alt="Football Championship League"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-2">
                {/* Book Now Button */}
                <div className="mb-8 flex justify-center">
                    <button
                        onClick={() => router.push('/play')}
                        className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                        style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
                    >
                        BOOK NOW
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

