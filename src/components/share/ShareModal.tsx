'use client';

import { useRef, cloneElement, isValidElement } from 'react';
import { X } from 'lucide-react';
import { BottomDrawer } from '../common/BottomDrawer';
import { ShareButtons } from './ShareButtons';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    type: 'profile' | 'match';
    playerName?: string;
}

export const ShareModal = ({ isOpen, onClose, children, type, playerName }: ShareModalProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const captureRef = useRef<HTMLDivElement>(null);

    // Clone children and add ref
    const childrenWithRef = isValidElement(children)
        ? cloneElement(children as React.ReactElement<any>, { ref: cardRef })
        : children;

    return (
        <BottomDrawer isOpen={isOpen} onClose={onClose} height="full">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Share Your Stats</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Shareable Card */}
                <div className="flex-1 overflow-y-auto p-2 pb-1">
                    <div ref={captureRef} className="flex justify-center">
                        {childrenWithRef}
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="border-t border-gray-700 bg-[#0B1E19]">
                    <ShareButtons
                        cardRef={captureRef}
                        type={type}
                        playerName={playerName}
                    />
                </div>
            </div>
        </BottomDrawer>
    );
};

