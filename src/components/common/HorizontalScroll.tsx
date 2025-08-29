'use client';

import { ReactNode, useRef } from 'react';

interface HorizontalScrollProps {
    children: ReactNode;
    className?: string;
    itemClassName?: string;
    showGradient?: boolean;
}

export const HorizontalScroll = ({
    children,
    className = '',
    itemClassName = '',
    showGradient = true
}: HorizontalScrollProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className={`relative ${className}`}>
            {/* Left gradient fade */}
            {showGradient && (
                <div className="absolute left-0 top-0 z-10 h-full w-8 pointer-events-none" />
            )}

            {/* Right gradient fade */}
            {showGradient && (
                <div className="absolute right-0 top-0 z-10 h-full w-8 pointer-events-none" />
            )}

            {/* Scrollable container */}
            <div
                ref={scrollRef}
                className={`
          flex gap-3 overflow-x-auto scrollbar-hide
          scroll-smooth
          ${itemClassName}
        `}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                } as React.CSSProperties}
            >
                {children}
            </div>
        </div>
    );
};
