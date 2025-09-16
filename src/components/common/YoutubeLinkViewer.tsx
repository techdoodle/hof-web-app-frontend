'use client';

import { useState } from 'react';

interface YoutubeLinkViewerProps {
    link?: string;
    width?: string;
    height?: string;
    className?: string;
}

export default function YoutubeLinkViewer({
    link,
    width = "200",
    height = "100",
    className = ""
}: YoutubeLinkViewerProps) {

    const [embedError, setEmbedError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Don't render anything if link is empty/undefined
    if (!link || link.trim() === '') {
        return null;
    }

    // Validate if the URL is a YouTube URL
    const isValidYouTubeUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/;
        return youtubeRegex.test(url);
    };

    // Extract video ID from various YouTube URL formats
    const getVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    // Get embed URL from YouTube URL
    const getEmbedUrl = (youtubeUrl: string): string | null => {
        const videoId = getVideoId(youtubeUrl);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    // Get mobile app URL (opens YouTube app if available)
    const getMobileUrl = (youtubeUrl: string): string => {
        const videoId = getVideoId(youtubeUrl);
        if (!videoId) return youtubeUrl;

        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            return `youtube://watch?v=${videoId}`;
        }
        return `https://www.youtube.com/watch?v=${videoId}`;
    };

    // Handle click to open in new tab/app
    const handleClick = () => {
        const mobileUrl = getMobileUrl(link);

        // Try to open YouTube app first on mobile
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            const videoId = getVideoId(link);
            if (videoId) {
                // Try YouTube app first
                window.location.href = `youtube://watch?v=${videoId}`;

                // Fallback to web after short delay
                setTimeout(() => {
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                }, 1000);
                return;
            }
        }

        // Desktop: open in new tab
        window.open(mobileUrl, '_blank', 'noopener,noreferrer');
    };

    // If not a valid YouTube URL, show error
    if (!isValidYouTubeUrl(link)) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <p className="text-red-700 text-sm">
                    ⚠️ Invalid YouTube URL
                </p>
                <button
                    onClick={() => window.open(link, '_blank')}
                    className="text-red-600 hover:text-red-800 underline text-xs mt-1"
                >
                    Open original link →
                </button>
            </div>
        );
    }

    const embedUrl = getEmbedUrl(link);

    // If embed fails or no embed URL, show fallback
    if (embedError || !embedUrl) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 text-center ${className}`}>
                <div className="mb-2">
                    <span className="text-2xl">📺</span>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                    YouTube Video Preview
                </p>
                <button
                    onClick={handleClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Watch on YouTube →
                </button>
            </div>
        );
    }

    return (
        <div
            className={`relative bg-black rounded-lg overflow-hidden ${className}`}
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            {/* Loading placeholder */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    {/* <div className="text-gray-500 text-sm">Loading video...</div> */}
                </div>
            )}

            {/* Embedded iframe */}
            <iframe
                src={embedUrl}
                width={width}
                height={height}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setEmbedError(true);
                    setIsLoading(false);
                }}
                style={{ width: `${width}px`, height: `${height}px` }}
                className="block"
            />

            {/* Overlay click handler for mobile */}
            <div
                onClick={handleClick}
                className="absolute inset-0 bg-transparent cursor-pointer md:hidden"
                title="Open in YouTube app"
            />

            {/* Open externally button */}
            <button
                onClick={handleClick}
                className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded text-xs hidden md:block"
                title="Open in YouTube"
            >
                ↗
            </button>
        </div>
    );
}
