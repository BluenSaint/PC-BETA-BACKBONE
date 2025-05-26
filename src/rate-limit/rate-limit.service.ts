import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

/**
 * Interface for rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly DEFAULT_LIMIT = 100; // Default requests per minute
  private readonly DEFAULT_WINDOW = 60; // Default window in seconds (1 minute)

  constructor(private readonly redisService: RedisService) {}

  /**
   * Generate a rate limit key based on identifier and action
   * @param identifier The unique identifier (e.g., IP address, user ID)
   * @param action Optional action name to separate rate limits for different actions
   * @returns Formatted rate limit key
   */
  private generateKey(identifier: string, action: string = 'default'): string {
    return `ratelimit:${action}:${identifier}`;
  }

  /**
   * Check if a request is allowed based on rate limits
   * @param identifier The unique identifier (e.g., IP address, user ID)
   * @param action Optional action name to separate rate limits for different actions
   * @param limit Optional custom limit (defaults to 100 requests per minute)
   * @param window Optional custom window in seconds (defaults to 60 seconds)
   * @returns Rate limit check result
   */
  async checkRateLimit(
    identifier: string,
    action: string = 'default',
    limit: number = this.DEFAULT_LIMIT,
    window: number = this.DEFAULT_WINDOW,
  ): Promise<RateLimitResult> {
    const key = this.generateKey(identifier, action);
    const now = Math.floor(Date.now() / 1000);
    const resetTime = now + window;

    try {
      // Check if Redis is connected
      if (!this.redisService.isRedisConnected()) {
        this.logger.warn('Redis is not connected, allowing request by default');
        return {
          allowed: true,
          remaining: limit,
          resetTime,
          limit,
        };
      }

      // Check if key exists
      const exists = await this.redisService.exists(key);
      if (!exists) {
        // First request, set counter to 1 with expiration
        await this.redisService.set(key, 1, window);
        return {
          allowed: true,
          remaining: limit - 1,
          resetTime,
          limit,
        };
      }

      // Increment counter
      const count = await this.redisService.incr(key);
      if (count === null) {
        // Redis error, allow request by default
        this.logger.warn('Redis increment failed, allowing request by default');
        return {
          allowed: true,
          remaining: 0,
          resetTime,
          limit,
        };
      }

      // Get TTL to calculate reset time
      const ttl = await this.redisService.getClient().ttl(key);
      const calculatedResetTime = ttl > 0 ? now + ttl : resetTime;

      // Check if limit exceeded
      const remaining = Math.max(0, limit - count);
      const allowed = count <= limit;

      return {
        allowed,
        remaining,
        resetTime: calculatedResetTime,
        limit,
      };
    } catch (error) {
      this.logger.error(`Error checking rate limit for ${identifier}: ${error.message}`, error.stack);
      
      // In case of error, allow the request to proceed
      return {
        allowed: true,
        remaining: 0,
        resetTime,
        limit,
      };
    }
  }

  /**
   * Reset rate limit for a specific identifier and action
   * @param identifier The unique identifier
   * @param action Optional action name
   * @returns true if successful, false otherwise
   */
  async resetRateLimit(identifier: string, action: string = 'default'): Promise<boolean> {
    try {
      const key = this.generateKey(identifier, action);
      return await this.redisService.del(key);
    } catch (error) {
      this.logger.error(`Error resetting rate limit for ${identifier}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get default rate limit values
   * @returns Object containing default limit and window
   */
  getDefaults(): { limit: number; window: number } {
    return {
      limit: this.DEFAULT_LIMIT,
      window: this.DEFAULT_WINDOW,
    };
  }
}
