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
                    borderImageSlice: 1
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
            >
                {/* Drag Handle */}
                {showHandle && (
                    <div className="w-12 h-1 bg-gray-400 rounded-full mx-auto mt-3 mb-3 cursor-grab active:cursor-grabbing" />
                )}

                {/* Content */}
                <div className={`${showHandle ? 'p-6 pt-0' : 'p-6'} h-full overflow-y-auto`}>
                    {children}
                </div>
            </div>
        </div>
    );
};
