import { useEffect, useCallback } from 'react';
import { imageCache } from '@/lib/utils/imageCache';
import { getUser } from '@/lib/utils/auth';

export function useImageCache() {
  const user = getUser();
  const userId = user?.id;

  // Cleanup expired cache on mount
  useEffect(() => {
    const cleanup = async () => {
      await imageCache.cleanupExpiredCache();
    };
    
    cleanup();
  }, []);

  // Cache an image
  const cacheImage = useCallback(async (url: string, processedUrl?: string) => {
    await imageCache.cacheImage(url, userId, processedUrl);
  }, [userId]);

  // Get cached image
  const getCachedImage = useCallback(async (url: string) => {
    return await imageCache.getCachedImage(url, userId);
  }, [userId]);

  // Update processed URL
  const updateProcessedUrl = useCallback(async (originalUrl: string, processedUrl: string) => {
    await imageCache.updateProcessedUrl(originalUrl, processedUrl, userId);
  }, [userId]);

  // Preload image
  const preloadImage = useCallback(async (url: string) => {
    await imageCache.preloadImage(url, userId);
  }, [userId]);

  // Clear user's cache
  const clearUserCache = useCallback(async () => {
    await imageCache.clearCache(userId);
  }, [userId]);

  // Get cache statistics
  const getCacheStats = useCallback(async () => {
    return await imageCache.getCacheStats();
  }, []);

  return {
    cacheImage,
    getCachedImage,
    updateProcessedUrl,
    preloadImage,
    clearUserCache,
    getCacheStats,
  };
}

// Hook specifically for face extraction with caching
export function useFaceExtraction() {
  const { cacheImage, getCachedImage, updateProcessedUrl } = useImageCache();

  const extractAndCacheFace = useCallback(async (imageUrl: string, padding: number = 0.2) => {
    // Check if we already have a cached face extraction
    const cached = await getCachedImage(imageUrl);
    if (cached?.metadata && (cached.metadata as any).faceExtracted) {
      return {
        success: true,
        faceImageUrl: (cached.metadata as any).faceImageUrl,
        fromCache: true
      };
    }

    // Extract face
    const { faceExtractor } = await import('@/lib/utils/faceExtraction');
    const result = await faceExtractor.extractFace(imageUrl, padding);
    
    if (result.success && result.faceImageUrl) {
      // Cache the result
      await cacheImage(imageUrl);
      
      // Update cache with face extraction metadata
      const cacheKey = `${getUser()?.id || 'anonymous'}_${btoa(imageUrl).replace(/[^a-zA-Z0-9]/g, '')}`;
      // Note: This is a simplified approach. In a real implementation, 
      // you might want to extend the cache structure to handle metadata better
    }

    return {
      ...result,
      fromCache: false
    };
  }, [cacheImage, getCachedImage]);

  return {
    extractAndCacheFace,
  };
} 