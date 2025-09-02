'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface BottomDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    height?: 'half' | 'full' | string;
    showHandle?: boolean;
}

export const BottomDrawer = ({
    isOpen,
    onClose,
    children,
    height = 'half',
    showHandle = true
}: BottomDrawerProps) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);
    const isDragging = useRef<boolean>(false);

    // Handle touch/mouse events for swipe down
    const handleStart = (clientY: number) => {
        startY.current = clientY;
        currentY.current = clientY;
        isDragging.current = true;
    };

    const handleMove = (clientY: number) => {
        if (!isDragging.current || !drawerRef.current) return;

        currentY.current = clientY;
        const deltaY = currentY.current - startY.current;

        // Only allow downward movement
        if (deltaY > 0) {
            drawerRef.current.style.transform = `translateY(${deltaY}px)`;
        }
    };

    const handleEnd = () => {
        if (!isDragging.current || !drawerRef.current) return;

        const deltaY = currentY.current - startY.current;

        // Close if swiped down more than 100px
        if (deltaY > 100) {
            onClose();
        } else {
            // Reset position
            drawerRef.current.style.transform = 'translateY(0)';
        }

        isDragging.current = false;
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        handleStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    // Mouse events for desktop
    const handleMouseDown = (e: React.MouseEvent) => {
        handleStart(e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientY);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    // Outside click handler
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    // Add/remove mouse event listeners
    useEffect(() => {
        if (isDragging.current) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging.current]);

    // Reset drawer position when opened/closed
    useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.style.transform = 'translateY(0)';
        }
    }, [isOpen]);

    // Manage body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Determine height class
    const getHeightClass = () => {
        switch (height) {
            case 'half':
                return 'h-1/2';
            case 'full':
                return 'h-full';
            default:
                return height; // Assume it's a custom Tailwind class
        }
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-end"
            onClick={handleOverlayClick}
            style={{
                // iOS-specific fixes
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                height: '100dvh',
                // Fix for iOS viewport issues
                minHeight: '-webkit-fill-available',
                WebkitOverflowScrolling: 'touch'
            } as React.CSSProperties}
        >
            {/* Overlay Background */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`relative w-full ${getHeightClass()} rounded-t-3xl transform transition-transform duration-300 ease-out`}
                style={{
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    background: 'linear-gradient(0deg, var(--Dark-Background, #0D1F1E), var(--Dark-Background, #0D1F1E)), linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
                    border: '1px solid',
                    borderImageSource: 'linear-gradient(0deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07)), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
                    borderImageSlice: 1,
                    // iOS-specific fixes for drawer
                    WebkitTransform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    WebkitTransition: 'transform 300ms ease-out, -webkit-transform 300ms ease-out',
                    // Prevent scrolling issues on iOS
                    WebkitOverflowScrolling: 'touch',
                    // Fix border rendering issues on iOS
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    // Ensure proper layering on iOS
                    isolation: 'isolate'
                } as React.CSSProperties}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
            >
                {/* Drag Handle */}
                {showHandle && (
                    <div
                        className="w-12 h-1 bg-gray-400 rounded-full mx-auto mt-3 mb-3 cursor-grab active:cursor-grabbing"
                        style={{
                            // Prevent handle distortion on iOS
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none'
                        } as React.CSSProperties}
                    />
                )}

                {/* Content */}
                <div
                    className={`${showHandle ? 'p-6 pt-0' : 'p-6'} h-full overflow-y-auto`}
                    style={{
                        // iOS-specific content fixes
                        WebkitOverflowScrolling: 'touch',
                        // Prevent content from being distorted
                        WebkitTransform: 'translateZ(0)',
                        transform: 'translateZ(0)',
                        // Fix for iOS safe area
                        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))'
                    } as React.CSSProperties}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
