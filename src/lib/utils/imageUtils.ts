/**
 * Utility functions for handling images in the application
 */

/**
 * Checks if a URL is a valid image URL
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a data URL (base64)
  if (url.startsWith('data:image/')) return true;
  
  // Check if it's a valid HTTP/HTTPS URL
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  
  return false;
}

/**
 * Gets a properly formatted image URL, with fallback handling
 */
export function getImageUrl(
  url: string | null | undefined,
  fallback: string = '/default-avatar.png'
): string {
  if (!url || typeof url !== 'string') {
    console.warn('Invalid image URL provided:', url);
    return fallback;
  }

  // Handle base64 data URLs
  if (url.startsWith('data:image/')) {
    return url;
  }

  // Handle full URLs (Firebase, Cloudinary, etc.)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle relative URLs (add base URL if needed)
  if (url.startsWith('/')) {
    // If it's a relative path, could add API base URL here if needed
    return url;
  }

  console.warn('Unrecognized image URL format:', url);
  return fallback;
}

/**
 * Logs image loading errors for debugging
 */
export function logImageError(url: string | null | undefined, error?: any) {
  console.error('Failed to load image:', {
    url,
    error,
    isValidUrl: isValidImageUrl(url),
    timestamp: new Date().toISOString()
  });
}

/**
 * Creates an image loader with retry logic
 */
export async function loadImageWithRetry(
  url: string,
  retries: number = 2
): Promise<boolean> {
  for (let i = 0; i <= retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error('Failed to load'));
        img.src = url;
      });
      return true;
    } catch (error) {
      if (i === retries) {
        logImageError(url, error);
        return false;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return false;
}

