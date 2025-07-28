interface CacheItem<T> {
  value: T;
  expiry: number;
}

interface CacheStats {
  keys: number;
  hits: number;
  misses: number;
  ksize: number;
  vsize: number;
}

class BrowserCache {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;
  private stats: CacheStats;
  private cleanupInterval: number;

  constructor(options: { stdTTL?: number; checkperiod?: number; useClones?: boolean } = {}) {
    this.cache = new Map();
    this.defaultTTL = (options.stdTTL || 600) * 1000; // Convert to milliseconds
    this.stats = {
      keys: 0,
      hits: 0,
      misses: 0,
      ksize: 0,
      vsize: 0
    };

    // Set up periodic cleanup
    const checkperiod = (options.checkperiod || 120) * 1000;
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
    }, checkperiod);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        this.stats.keys--;
      }
    }
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() > item.expiry;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const expiryTime = Date.now() + (ttl ? ttl * 1000 : this.defaultTTL);
      const item: CacheItem<T> = {
        value,
        expiry: expiryTime
      };

      const wasPresent = this.cache.has(key);
      this.cache.set(key, item);
      
      if (!wasPresent) {
        this.stats.keys++;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return undefined;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.keys--;
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return item.value as T;
  }

  del(key: string): number {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.keys--;
      return 1;
    }
    return 0;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.keys--;
      return false;
    }

    return true;
  }

  flushAll(): void {
    this.cache.clear();
    this.stats.keys = 0;
  }

  getStats(): CacheStats {
    // Update key count to reflect current state
    this.stats.keys = this.cache.size;
    return { ...this.stats };
  }

  // Clean up interval when cache is destroyed
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

import { config } from '../config/environment';

class CacheService {
  private cache: BrowserCache;

  constructor() {
    this.cache = new BrowserCache({
      stdTTL: 600, // Default 10 minutes
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false
    });
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  // Specialized cache methods
  cacheJobSearch(query: string, location: string, results: any[]): void {
    const key = `job_search:${query}:${location}`;
    this.set(key, results, config.cache.jobSearchTTL);
  }

  getCachedJobSearch(query: string, location: string): any[] | undefined {
    const key = `job_search:${query}:${location}`;
    return this.get(key);
  }

  cacheCVAnalysis(cvHash: string, analysis: any): void {
    const key = `cv_analysis:${cvHash}`;
    this.set(key, analysis, config.cache.cvAnalysisTTL);
  }

  getCachedCVAnalysis(cvHash: string): any | undefined {
    const key = `cv_analysis:${cvHash}`;
    return this.get(key);
  }

  cacheUserProfile(userId: string, profile: any): void {
    const key = `user_profile:${userId}`;
    this.set(key, profile, config.cache.userProfileTTL);
  }

  getCachedUserProfile(userId: string): any | undefined {
    const key = `user_profile:${userId}`;
    return this.get(key);
  }
}

export const cacheService = new CacheService();