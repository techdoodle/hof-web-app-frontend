export interface CachedImage {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  timestamp: number;
  userId?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    mimeType: string;
  };
}

export class ImageCache {
  private static instance: ImageCache;
  private memoryCache = new Map<string, CachedImage>();
  private dbName = 'hof-image-cache';
  private storeName = 'images';
  private maxMemorySize = 50; // Maximum items in memory cache
  private maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Only initialize IndexedDB in browser environment
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      this.initializeDB();
    }
  }

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  private async initializeDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private generateCacheKey(url: string, userId?: string): string {
    return `${userId || 'anonymous'}_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  private async getDB(): Promise<IDBDatabase | null> {
    // Only use IndexedDB in browser environment
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      return this.initializeDB();
    }
    return null;
  }

  private cleanupMemoryCache(): void {
    if (this.memoryCache.size > this.maxMemorySize) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest entries
      const toRemove = entries.slice(0, entries.length - this.maxMemorySize);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  async cacheImage(url: string, userId?: string, processedUrl?: string): Promise<void> {
    const cacheKey = this.generateCacheKey(url, userId);
    
    try {
      // Create blob from URL for metadata
      const response = await fetch(url);
      const blob = await response.blob();
      
      const cachedImage: CachedImage = {
        id: cacheKey,
        originalUrl: url,
        processedUrl,
        timestamp: Date.now(),
        userId,
        metadata: {
          width: 0, // Will be set when image loads
          height: 0,
          size: blob.size,
          mimeType: blob.type
        }
      };

      // Store in memory cache
      this.memoryCache.set(cacheKey, cachedImage);
      this.cleanupMemoryCache();

      // Store in IndexedDB
      const db = await this.getDB();
      if (db) {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        await store.put(cachedImage);
      }

    } catch (error) {
      console.error('Failed to cache image:', error);
    }
  }

  async getCachedImage(url: string, userId?: string): Promise<CachedImage | null> {
    const cacheKey = this.generateCacheKey(url, userId);
    
    // Check memory cache first
    const memoryResult = this.memoryCache.get(cacheKey);
    if (memoryResult && this.isValidCache(memoryResult)) {
      return memoryResult;
    }

    // Check IndexedDB
    try {
      const db = await this.getDB();
      if (db) {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(cacheKey);
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const result = request.result;
            if (result && this.isValidCache(result)) {
              // Add back to memory cache
              this.memoryCache.set(cacheKey, result);
              resolve(result);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => resolve(null);
        });
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve cached image:', error);
      return null;
    }
  }

  private isValidCache(cachedImage: CachedImage): boolean {
    const age = Date.now() - cachedImage.timestamp;
    return age < this.maxAgeMs;
  }

  async updateProcessedUrl(originalUrl: string, processedUrl: string, userId?: string): Promise<void> {
    const cacheKey = this.generateCacheKey(originalUrl, userId);
    
    // Update memory cache
    const memoryItem = this.memoryCache.get(cacheKey);
    if (memoryItem) {
      memoryItem.processedUrl = processedUrl;
      memoryItem.timestamp = Date.now();
    }

    // Update IndexedDB
    try {
      const db = await this.getDB();
      if (db) {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const getRequest = store.get(cacheKey);
        
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          if (result) {
            result.processedUrl = processedUrl;
            result.timestamp = Date.now();
            store.put(result);
          }
        };
      }
    } catch (error) {
      console.error('Failed to update processed URL:', error);
    }
  }

  async clearCache(userId?: string): Promise<void> {
    // Clear memory cache
    if (userId) {
      const entries = Array.from(this.memoryCache.entries());
      for (const [key, value] of entries) {
        if (value.userId === userId) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      this.memoryCache.clear();
    }

    // Clear IndexedDB
    try {
      const db = await this.getDB();
      if (db) {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        if (userId) {
          const index = store.index('userId');
          const request = index.openCursor(IDBKeyRange.only(userId));
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            }
          };
        } else {
          store.clear();
        }
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async cleanupExpiredCache(): Promise<void> {
    const cutoffTime = Date.now() - this.maxAgeMs;
    
    // Clean memory cache
    const entries = Array.from(this.memoryCache.entries());
    for (const [key, value] of entries) {
      if (value.timestamp < cutoffTime) {
        this.memoryCache.delete(key);
      }
    }

    // Clean IndexedDB
    try {
      const db = await this.getDB();
      if (db) {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('timestamp');
        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      }
    } catch (error) {
      console.error('Failed to cleanup expired cache:', error);
    }
  }

  // Preload image into cache
  async preloadImage(url: string, userId?: string): Promise<void> {
    const cached = await this.getCachedImage(url, userId);
    if (!cached) {
      await this.cacheImage(url, userId);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    memoryItems: number;
    dbItems: number;
    totalSize: number;
  }> {
    const memoryItems = this.memoryCache.size;
    
    try {
      const db = await this.getDB();
      if (db) {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const countRequest = store.count();
        
        return new Promise((resolve) => {
          countRequest.onsuccess = () => {
            resolve({
              memoryItems,
              dbItems: countRequest.result,
              totalSize: Array.from(this.memoryCache.values())
                .reduce((sum, item) => sum + (item.metadata?.size || 0), 0)
            });
          };
          countRequest.onerror = () => resolve({
            memoryItems,
            dbItems: 0,
            totalSize: 0
          });
        });
      }
      return {
        memoryItems,
        dbItems: 0,
        totalSize: 0
      };
    } catch (error) {
      return {
        memoryItems,
        dbItems: 0,
        totalSize: 0
      };
    }
  }
}

export const imageCache = ImageCache.getInstance(); 