'use client';

import { useState, useRef } from 'react';
import { Share2, Download, MessageCircle, Instagram } from 'lucide-react';
import { downloadCardAsPNG, shareToWhatsApp, shareToWhatsAppStory, shareToInstagram, shareViaWebShare } from '@/lib/utils/shareUtils';

interface ShareButtonsProps {
    cardRef: React.RefObject<HTMLDivElement>;
    type: 'profile' | 'match';
    playerName?: string;
}

export const ShareButtons = ({ cardRef, type, playerName }: ShareButtonsProps) => {
    const [isSharing, setIsSharing] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            const filename = type === 'profile'
                ? `${playerName || 'player'}-stats`
                : `${playerName || 'player'}-match-stats`;
            await downloadCardAsPNG(cardRef.current, filename);
        } catch (error) {
            console.error('Error downloading:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleWhatsAppMessage = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            const message = type === 'profile'
                ? `Check out my football stats at Humans of Football!`
                : `Check out my match performance at Humans of Football!`;
            await shareToWhatsApp(cardRef.current, message);
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleWhatsAppStory = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            await shareToWhatsAppStory(cardRef.current);
        } catch (error) {
            console.error('Error sharing to WhatsApp Story:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleInstagram = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            await shareToInstagram(cardRef.current);
        } catch (error) {
            console.error('Error sharing to Instagram:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleWebShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            const title = type === 'profile'
                ? `${playerName || 'My'} Stats`
                : `${playerName || 'My'} Match Performance`;
            await shareViaWebShare(cardRef.current, title);
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="flex flex-wrap gap-3 justify-center items-center p-4">
            {/* Download PNG */}
            <button
                onClick={handleDownload}
                disabled={isSharing}
                className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download as PNG"
            >
                <Download className="w-5 h-5 text-white" />
                <span className="text-xs text-white">Download</span>
            </button>

            {/* WhatsApp Message */}
            <button
                onClick={handleWhatsAppMessage}
                disabled={isSharing}
                className="flex flex-col items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share to WhatsApp"
            >
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-xs text-white">WhatsApp</span>
            </button>

            {/* WhatsApp Story */}
            <button
                onClick={handleWhatsAppStory}
                disabled={isSharing}
                className="flex flex-col items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share to WhatsApp Story"
            >
                <Share2 className="w-5 h-5 text-white" />
                <span className="text-xs text-white">WA Story</span>
            </button>

            {/* Instagram */}
            <button
                onClick={handleInstagram}
                disabled={isSharing}
                className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share to Instagram"
            >
                <Instagram className="w-5 h-5 text-white" />
                <span className="text-xs text-white">Instagram</span>
            </button>

            {/* Web Share API (for mobile) */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                    onClick={handleWebShare}
                    disabled={isSharing}
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Share via system share"
                >
                    <Share2 className="w-5 h-5 text-white" />
                    <span className="text-xs text-white">Share</span>
                </button>
            )}
        </div>
    );
};

