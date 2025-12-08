import html2canvas from 'html2canvas';

// Cache to store generated images
const imageCache = new Map<string, Blob>();

/**
 * Generates a cache key from the element
 */
const getCacheKey = (element: HTMLElement): string => {
    // Use element's content and dimensions as cache key
    const rect = element.getBoundingClientRect();
    const content = element.innerHTML.substring(0, 100); // First 100 chars of content
    return `${rect.width}-${rect.height}-${content.length}-${content}`;
};

/**
 * Generates canvas from element with proper options to capture full content
 */
const generateCanvas = async (cardElement: HTMLElement): Promise<HTMLCanvasElement> => {
    // Wait for all images to load
    const images = cardElement.querySelectorAll('img');
    await Promise.all(
        Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if image fails
                // Timeout after 5 seconds
                setTimeout(resolve, 5000);
            });
        })
    );

    // Calculate the actual height needed to include all content including absolutely positioned elements
    const rect = cardElement.getBoundingClientRect();
    const scrollHeight = Math.max(
        cardElement.scrollHeight,
        rect.height,
        // Check for absolutely positioned bottom elements
        Array.from(cardElement.querySelectorAll('[class*="absolute"]')).reduce((max, el) => {
            const htmlEl = el as HTMLElement;
            const elRect = htmlEl.getBoundingClientRect();
            const cardRect = cardElement.getBoundingClientRect();
            const bottomOffset = elRect.bottom - cardRect.top;
            return Math.max(max, bottomOffset);
        }, cardElement.scrollHeight)
    );

    return await html2canvas(cardElement, {
        backgroundColor: '#0B1E19',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        height: scrollHeight,
        width: cardElement.scrollWidth || rect.width,
        scrollX: 0,
        scrollY: 0,
        // Ensure we capture the full element including absolutely positioned children
        onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('.shareable-card') as HTMLElement;
            if (clonedElement) {
                // Ensure all content is visible in the clone
                clonedElement.style.overflow = 'visible';
                clonedElement.style.height = scrollHeight + 'px';

                // Make sure all absolutely positioned elements are visible
                const absoluteElements = clonedElement.querySelectorAll('[class*="absolute"]');
                absoluteElements.forEach((el) => {
                    const htmlEl = el as HTMLElement;
                    htmlEl.style.visibility = 'visible';
                    htmlEl.style.opacity = '1';
                });
            }
        },
    });
};

/**
 * Gets or generates the image blob for a card element
 */
const getCardImageBlob = async (cardElement: HTMLElement): Promise<Blob> => {
    const cacheKey = getCacheKey(cardElement);

    // Check cache first
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey)!;
    }

    // Generate new image
    const canvas = await generateCanvas(cardElement);

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                // Cache the blob
                imageCache.set(cacheKey, blob);
                resolve(blob);
            } else {
                reject(new Error('Failed to generate image blob'));
            }
        }, 'image/png');
    });
};

/**
 * Downloads the card as a PNG image
 */
export const downloadCardAsPNG = async (cardElement: HTMLElement, filename: string = 'player-card') => {
    try {
        const blob = await getCardImageBlob(cardElement);

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
};

/**
 * Shares to WhatsApp as a message with image
 * On mobile: Uses Web Share API to share image directly
 * On desktop: Downloads image and opens WhatsApp Web with text (user can attach image manually)
 */
export const shareToWhatsApp = async (cardElement: HTMLElement, message: string = 'Check out my stats!') => {
    try {
        const blob = await getCardImageBlob(cardElement);
        const file = new File([blob], 'player-card.png', { type: 'image/png' });

        // Check if Web Share API is available (mobile devices)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'My Player Stats',
                    text: message,
                });
                return;
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    return; // User cancelled
                }
                console.error('Web Share API failed, falling back:', error);
            }
        }

        // Fallback for desktop: Download image first
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'player-card.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Open WhatsApp Web with message (user can attach the downloaded image)
        setTimeout(() => {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + '\n\n📸 Image downloaded! Attach it to share.')}`;
            window.open(whatsappUrl, '_blank');
        }, 500);
    } catch (error) {
        console.error('Error sharing to WhatsApp:', error);
    }
};

/**
 * Shares to WhatsApp Story
 * Note: WhatsApp Web doesn't support direct story sharing, so we'll share as image
 */
export const shareToWhatsAppStory = async (cardElement: HTMLElement) => {
    try {
        const blob = await getCardImageBlob(cardElement);
        const file = new File([blob], 'player-card.png', { type: 'image/png' });

        // For mobile devices, try to use Web Share API
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: 'My Player Stats',
                text: 'Check out my stats!',
            }).catch((error) => {
                console.error('Error sharing:', error);
                // Fallback to download
                downloadCardAsPNG(cardElement, 'player-card');
            });
        } else {
            // Fallback: download the image
            downloadCardAsPNG(cardElement, 'player-card');
        }
    } catch (error) {
        console.error('Error sharing to WhatsApp Story:', error);
        // Fallback to download
        downloadCardAsPNG(cardElement, 'player-card');
    }
};

/**
 * Shares to Instagram
 * Note: Instagram doesn't have a direct web API
 * On mobile: Uses Web Share API if available
 * On desktop: Downloads image for manual upload
 */
export const shareToInstagram = async (cardElement: HTMLElement) => {
    try {
        const blob = await getCardImageBlob(cardElement);
        const file = new File([blob], 'player-card.png', { type: 'image/png' });

        // Try Web Share API first (works on mobile, some browsers)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'My Player Stats',
                    text: 'Check out my stats!',
                });
                return;
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    return; // User cancelled
                }
                console.error('Web Share API failed, falling back:', error);
            }
        }

        // Fallback: Download image for manual upload
        await downloadCardAsPNG(cardElement, 'player-card-for-instagram');

        // Show a message to user (you can replace this with a toast notification)
        alert('Image downloaded! You can now upload it to Instagram Stories or Posts.');
    } catch (error) {
        console.error('Error sharing to Instagram:', error);
    }
};

/**
 * Uses Web Share API if available (for mobile devices)
 */
export const shareViaWebShare = async (cardElement: HTMLElement, title: string = 'My Player Stats') => {
    try {
        if (navigator.share) {
            const blob = await getCardImageBlob(cardElement);
            const file = new File([blob], 'player-card.png', { type: 'image/png' });

            try {
                await navigator.share({
                    files: [file],
                    title: title,
                    text: 'Check out my stats!',
                });
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                    // Fallback to download
                    downloadCardAsPNG(cardElement, 'player-card');
                }
            }
        } else {
            // Fallback to download
            downloadCardAsPNG(cardElement, 'player-card');
        }
    } catch (error) {
        console.error('Error in Web Share:', error);
        downloadCardAsPNG(cardElement, 'player-card');
    }
};

/**
 * Pre-generates and caches the image for a card element
 * Call this when the card is loaded/visible to improve share performance
 */
export const preloadCardImage = async (cardElement: HTMLElement): Promise<void> => {
    try {
        await getCardImageBlob(cardElement);
    } catch (error) {
        console.error('Error preloading card image:', error);
        // Don't throw - preloading is optional
    }
};

/**
 * Clears the image cache (useful if card content changes)
 */
export const clearImageCache = () => {
    imageCache.clear();
};

