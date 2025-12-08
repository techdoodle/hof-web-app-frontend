'use client';

import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

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
    // Handle iOS viewport height issues
    useEffect(() => {
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);

        return () => {
            window.removeEventListener('resize', setViewportHeight);
        };
    }, []);

    // Handle drag gestures with Framer Motion
    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 80;
        const velocity = info.velocity.y;

        // Close if dragged down beyond threshold or fast downward swipe
        if (info.offset.y > threshold || velocity > 500) {
            onClose();
        }
    };

    // Manage body scroll with better iOS handling
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Get height value for different screen sizes
    const getHeightValue = () => {
        switch (height) {
            case 'half':
                return '58%'; // 58% of viewport height
            case 'full':
                return '90%';
            default:
                return height;
        }
    };

    // Animation variants for smooth transitions
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const drawerVariants = {
        hidden: {
            y: '100%',
            transition: {
                type: 'spring' as const,
                damping: 25,
                stiffness: 300
            }
        },
        visible: {
            y: 0,
            transition: {
                type: 'spring' as const,
                damping: 25,
                stiffness: 300
            }
        }
    };

    // Create drawer content with Framer Motion
    const drawerContent = (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={overlayVariants}
                    style={{
                        height: 'calc(var(--vh, 1vh) * 100)',
                        minHeight: 'calc(var(--vh, 1vh) * 100)',
                        zIndex: 99999,
                        isolation: 'isolate',
                        WebkitTransform: 'translateZ(0)',
                        transform: 'translateZ(0)'
                    } as React.CSSProperties}
                >
                    {/* Overlay Background - Click here to close */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        onTouchEnd={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        className="relative w-full rounded-t-3xl"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={drawerVariants}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        style={{
                            height: getHeightValue(),
                            background: 'linear-gradient(0deg, var(--Dark-Background, #0D1F1E), var(--Dark-Background, #0D1F1E)), linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
                            border: '1px solid',
                            borderImageSource: 'linear-gradient(0deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07)), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
                            borderImageSlice: 1,
                            WebkitOverflowScrolling: 'touch',
                            WebkitBackfaceVisibility: 'hidden',
                            backfaceVisibility: 'hidden',
                            isolation: 'isolate',
                            zIndex: 100000,
                            willChange: 'transform'
                        } as React.CSSProperties}
                    >
                        {/* Drag Handle */}
                        {showHandle && (
                            <motion.div
                                className="w-12 h-1 bg-gray-400 rounded-full mx-auto mt-3 mb-3 cursor-grab active:cursor-grabbing"
                                whileTap={{ scale: 1.1 }}
                                style={{
                                    WebkitTouchCallout: 'none',
                                    WebkitUserSelect: 'none',
                                    userSelect: 'none'
                                } as React.CSSProperties}
                            />
                        )}

                        {/* Content */}
                        <motion.div
                            className={`${showHandle ? 'p-2 pt-0' : 'p-6'} overflow-y-auto`}
                            style={{
                                height: showHandle ? 'calc(100% - 60px)' : '100%',
                                WebkitOverflowScrolling: 'touch',
                                WebkitTransform: 'translateZ(0)',
                                transform: 'translateZ(0)',
                                paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))'
                            } as React.CSSProperties}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Use portal to render outside current stacking context
    if (typeof window !== 'undefined') {
        return createPortal(drawerContent, document.body);
    }

    return null;
};
