import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from '../config/environment';
import { RateLimitError } from '../utils/errorHandler';

class RateLimiterService {
  private limiters: Map<string, RateLimiterMemory> = new Map();

  constructor() {
    // Initialize rate limiters for different operations
    Object.entries(config.rateLimits).forEach(([key, limit]) => {
      this.limiters.set(key, new RateLimiterMemory({
        points: limit.points,
        duration: limit.duration,
      }));
    });
  }

  async checkLimit(operation: string, identifier: string = 'default'): Promise<void> {
    const limiter = this.limiters.get(operation);
    if (!limiter) {
      throw new Error(`Rate limiter not configured for operation: ${operation}`);
    }

    try {
      await limiter.consume(identifier);
    } catch (rejRes: any) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      throw new RateLimitError(`Rate limit exceeded. Try again in ${secs} seconds.`);
    }
  }

  async getRemainingPoints(operation: string, identifier: string = 'default'): Promise<number> {
    const limiter = this.limiters.get(operation);
    if (!limiter) return 0;

    const res = await limiter.get(identifier);
    return res ? res.remainingPoints || 0 : config.rateLimits[operation as keyof typeof config.rateLimits]?.points || 0;
  }
}

export const rateLimiter = new RateLimiterService();