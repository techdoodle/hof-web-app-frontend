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
 * Preloads an image and returns a promise that resolves when loaded
 */
const preloadImage = (src: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (!src || src === 'undefined' || src.includes('skeleton.png')) {
            resolve(undefined);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        const timeout = setTimeout(() => {
            resolve(undefined); // Timeout after 8 seconds
        }, 8000);

        img.onload = () => {
            clearTimeout(timeout);
            // Wait a bit to ensure image is fully decoded
            setTimeout(() => resolve(undefined), 200);
        };

        img.onerror = () => {
            clearTimeout(timeout);
            resolve(undefined); // Continue even if image fails
        };

        img.src = src;
    });
};

/**
 * Generates canvas from element with proper options to capture full content
 */
const generateCanvas = async (cardElement: HTMLElement): Promise<HTMLCanvasElement> => {
    // Step 1: Find and preload all profile picture images directly from their URLs
    const profilePictureContainers = cardElement.querySelectorAll('[class*="ProfilePicture"], img[src*="storage.googleapis"], img[src*="firebasestorage"]');
    const imageUrls = new Set<string>();

    // Extract image URLs from img elements
    cardElement.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src') || img.src;
        if (src && !src.includes('skeleton.png') && !src.includes('hof-logo')) {
            // Remove cache-busting parameters
            const cleanUrl = src.split('?')[0].split('&')[0];
            imageUrls.add(cleanUrl);
        }
    });

    // Preload all images
    await Promise.all(Array.from(imageUrls).map(url => preloadImage(url)));

    // Step 2: Wait for all images in the DOM to load
    const images = cardElement.querySelectorAll('img');
    await Promise.all(
        Array.from(images).map((img) => {
            if (img.src.includes('skeleton.png') || img.src.includes('hof-logo')) {
                return Promise.resolve<void>(undefined);
            }

            if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                return Promise.resolve<void>(undefined);
            }

            return new Promise<void>((resolve) => {
                const timeout = setTimeout(() => resolve(undefined), 8000);
                img.onload = () => {
                    clearTimeout(timeout);
                    setTimeout(() => resolve(undefined), 200);
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    resolve(undefined);
                };
            });
        })
    );

    // Step 3: Wait for React state to update and images to be visible
    await new Promise<void>((resolve) => {
        let attempts = 0;
        const maxAttempts = 40; // Increased attempts

        const checkReady = () => {
            attempts++;

            // Check for visible skeletons
            const skeletons = cardElement.querySelectorAll('[class*="animate-pulse"]');
            const hasVisibleSkeletons = Array.from(skeletons).some((skeleton) => {
                const htmlEl = skeleton as HTMLElement;
                const style = window.getComputedStyle(htmlEl);
                return htmlEl.offsetParent !== null &&
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0';
            });

            // Check if profile images are actually visible (not hidden by loading state)
            const profileImages = cardElement.querySelectorAll('img:not([src*="skeleton"]):not([src*="hof-logo"])');
            const imagesVisible = Array.from(profileImages).every((img) => {
                const htmlImg = img as HTMLImageElement;
                const style = window.getComputedStyle(htmlImg);
                return htmlImg.complete &&
                    htmlImg.naturalWidth > 0 &&
                    htmlImg.naturalHeight > 0 &&
                    style.opacity !== '0' &&
                    style.visibility !== 'hidden';
            });

            if ((!hasVisibleSkeletons && imagesVisible) || attempts >= maxAttempts) {
                // Extra delay to ensure React has fully rendered
                setTimeout(resolve, 800);
            } else {
                setTimeout(checkReady, 250);
            }
        };

        // Start after a longer initial delay to let images load
        setTimeout(checkReady, 1000);
    });

    // Step 4: Calculate height explicitly including footer
    const rect = cardElement.getBoundingClientRect();

    // Find the footer element using data attribute or class
    const footer = cardElement.querySelector('[data-footer="true"]') as HTMLElement ||
        cardElement.querySelector('[class*="absolute"][class*="bottom-0"]') as HTMLElement;

    // Calculate actual footer height
    let footerHeight = 64; // Default to 64px (h-16)
    if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        footerHeight = footerRect.height || 64;
    }

    // Get the actual bottom position of all content
    let maxBottom = 0;
    cardElement.querySelectorAll('*').forEach((el) => {
        const htmlEl = el as HTMLElement;
        const elRect = htmlEl.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        const bottomPos = elRect.bottom - cardRect.top;
        if (bottomPos > maxBottom) {
            maxBottom = bottomPos;
        }
    });

    // Use the maximum of scrollHeight or calculated bottom position, add small padding
    const totalHeight = Math.ceil(Math.max(cardElement.scrollHeight, maxBottom) + 8);

    return await html2canvas(cardElement, {
        backgroundColor: '#0B1E19',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        height: totalHeight,
        width: cardElement.scrollWidth || rect.width,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('.shareable-card') as HTMLElement;
            if (clonedElement) {
                // Set explicit height
                clonedElement.style.height = totalHeight + 'px';
                clonedElement.style.minHeight = totalHeight + 'px';
                clonedElement.style.overflow = 'visible';
                // Preserve existing padding; just ensure overflow is visible

                // Remove all loading skeletons
                clonedElement.querySelectorAll('[class*="animate-pulse"]').forEach((el) => {
                    (el as HTMLElement).style.display = 'none';
                });

                // Force all images to be visible and loaded
                clonedElement.querySelectorAll('img').forEach((img) => {
                    const htmlImg = img as HTMLImageElement;
                    if (htmlImg.src.includes('skeleton.png')) {
                        htmlImg.style.display = 'none';
                    } else if (!htmlImg.src.includes('hof-logo')) {
                        // For profile images, ensure they're visible
                        htmlImg.style.opacity = '1';
                        htmlImg.style.visibility = 'visible';
                        htmlImg.style.display = '';
                        htmlImg.style.position = 'relative';
                        htmlImg.style.zIndex = '10';

                        // If image is not loaded, try to reload it
                        if (!htmlImg.complete || htmlImg.naturalWidth === 0) {
                            const originalSrc = htmlImg.src;
                            htmlImg.src = ''; // Clear src
                            setTimeout(() => {
                                htmlImg.src = originalSrc;
                            }, 10);
                        }
                    }
                });

                // Hide any parent elements that might be hiding images (loading overlays)
                clonedElement.querySelectorAll('[class*="absolute"][class*="inset"]').forEach((el) => {
                    const htmlEl = el as HTMLElement;
                    const style = window.getComputedStyle(htmlEl);
                    if (style.backgroundColor === 'rgba(0, 0, 0, 0)' ||
                        htmlEl.classList.toString().includes('animate-pulse') ||
                        htmlEl.classList.toString().includes('gradient')) {
                        htmlEl.style.display = 'none';
                    }
                });

                // Ensure footer is visible
                const clonedFooter = clonedElement.querySelector('[data-footer="true"]') as HTMLElement ||
                    clonedElement.querySelector('[class*="absolute"][class*="bottom-0"]') as HTMLElement;
                if (clonedFooter) {
                    clonedFooter.style.visibility = 'visible';
                    clonedFooter.style.opacity = '1';
                    clonedFooter.style.display = 'flex';
                    clonedFooter.style.position = 'absolute';
                    clonedFooter.style.bottom = '0';
                    clonedFooter.style.left = '0';
                    clonedFooter.style.right = '0';
                    clonedFooter.style.width = '100%';
                }

                // Make all absolute elements visible
                clonedElement.querySelectorAll('[class*="absolute"]').forEach((el) => {
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

