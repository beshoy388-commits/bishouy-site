/**
 * Simple in-memory cache for responses
 * In production, you'd use Redis or a similar tool.
 */
class MemoryCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();

  /**
   * Get an item from cache
   * @param key Unique key
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set an item in cache
   * @param key Unique key
   * @param value The value to store
   * @param ttlMs Time to live in milliseconds
   */
  set(key: string, value: T, ttlMs: number = 3600000): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs,
    });
  }

  /**
   * Remove an item from cache
   * @param key Unique key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all expired entries to save memory
   */
  prune(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Clear entire cache store
   */
  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance for AI responses
export const aiChatCache = new MemoryCache<string>();

// Global cache instance for generic DB queries (articles list, etc)
export const dbCache = new MemoryCache<any>();

// Prune the caches every 10 minutes
setInterval(() => {
  aiChatCache.prune();
  dbCache.prune();
}, 600000);
