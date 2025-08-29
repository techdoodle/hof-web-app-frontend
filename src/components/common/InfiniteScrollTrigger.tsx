import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    prefetchNextPage?: () => void;
    threshold?: number;
    rootMargin?: string;
    children?: React.ReactNode;
}

export function InfiniteScrollTrigger({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    prefetchNextPage,
    threshold = 0.1,
    rootMargin = '200px',
    children
}: InfiniteScrollTriggerProps) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const prefetchRef = useRef<HTMLDivElement>(null);

    // Main trigger for loading next page
    useEffect(() => {
        const triggerElement = triggerRef.current;
        if (!triggerElement || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            {
                threshold,
                rootMargin: rootMargin
            }
        );

        observer.observe(triggerElement);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold, rootMargin]);

    // Prefetch trigger - activates earlier to preload next page
    useEffect(() => {
        const prefetchElement = prefetchRef.current;
        if (!prefetchElement || !hasNextPage || !prefetchNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage) {
                    prefetchNextPage();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '400px' // Prefetch when user is 400px away
            }
        );

        observer.observe(prefetchElement);

        return () => observer.disconnect();
    }, [hasNextPage, prefetchNextPage]);

    return (
        <>
            {/* Prefetch trigger - placed earlier in the list */}
            <div ref={prefetchRef} className="h-1" />

            {children}

            {/* Main loading trigger */}
            <div ref={triggerRef} className="flex justify-center py-4">
                {hasNextPage && (
                    <div className="flex items-center gap-2">
                        {isFetchingNextPage ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00CC66]"></div>
                                <span className="text-[#00CC66] text-sm">Loading more...</span>
                            </>
                        ) : (
                            <span className="text-gray-500 text-sm">Scroll for more</span>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
