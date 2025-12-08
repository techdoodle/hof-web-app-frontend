import html2canvas from 'html2canvas';

/**
 * Downloads the card as a PNG image
 */
export const downloadCardAsPNG = async (cardElement: HTMLElement, filename: string = 'player-card') => {
    try {
        const canvas = await html2canvas(cardElement, {
            backgroundColor: '#0B1E19',
            scale: 2, // Higher quality
            logging: false,
            useCORS: true,
            allowTaint: true,
        });

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        }, 'image/png');
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
        const canvas = await html2canvas(cardElement, {
            backgroundColor: '#0B1E19',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
        });

        canvas.toBlob(async (blob) => {
            if (blob) {
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
            }
        }, 'image/png');
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
        const canvas = await html2canvas(cardElement, {
            backgroundColor: '#0B1E19',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
        });

        canvas.toBlob((blob) => {
            if (blob) {
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
            }
        }, 'image/png');
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
        const canvas = await html2canvas(cardElement, {
            backgroundColor: '#0B1E19',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
        });

        canvas.toBlob(async (blob) => {
            if (blob) {
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
            }
        }, 'image/png');
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
            const canvas = await html2canvas(cardElement, {
                backgroundColor: '#0B1E19',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            canvas.toBlob(async (blob) => {
                if (blob) {
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
                }
            }, 'image/png');
        } else {
            // Fallback to download
            downloadCardAsPNG(cardElement, 'player-card');
        }
    } catch (error) {
        console.error('Error in Web Share:', error);
        downloadCardAsPNG(cardElement, 'player-card');
    }
};

