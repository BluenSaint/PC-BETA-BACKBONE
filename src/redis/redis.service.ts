import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.initializeRedisClient();
      await this.testConnection();
      this.isConnected = true;
      this.logger.log('Successfully connected to Upstash Redis');
    } catch (error) {
      this.isConnected = false;
      this.logger.error(`Failed to connect to Upstash Redis: ${error.message}`, error.stack);
    }
  }

  private initializeRedisClient() {
    const url = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!url || !token) {
      throw new Error('Upstash Redis configuration is missing. Please check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.');
    }

    this.redis = new Redis({
      url,
      token,
    });
  }

  private async testConnection(): Promise<void> {
    try {
      const pingResult = await this.redis.ping();
      if (pingResult !== 'PONG') {
        throw new Error(`Unexpected response from Redis ping: ${pingResult}`);
      }
    } catch (error) {
      this.logger.error(`Redis connection test failed: ${error.message}`, error.stack);
      throw new Error(`Failed to connect to Redis: ${error.message}`);
    }
  }

  /**
   * Get a value from Redis by key
   * @param key The key to retrieve
   * @returns The value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, get operation failed');
        return null;
      }
      return await this.redis.get(key) as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Set a value in Redis
   * @param key The key to set
   * @param value The value to store
   * @param ttl Optional TTL in seconds
   * @returns true if successful, false otherwise
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, set operation failed');
        return false;
      }
      
      if (ttl) {
        await this.redis.set(key, value, { ex: ttl });
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Delete a key from Redis
   * @param key The key to delete
   * @returns true if successful, false otherwise
   */
  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, del operation failed');
        return false;
      }
      
      const result = await this.redis.del(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param key The key to check
   * @returns true if exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, exists operation failed');
        return false;
      }
      
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Increment a key in Redis
   * @param key The key to increment
   * @returns The new value or null if failed
   */
  async incr(key: string): Promise<number | null> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, incr operation failed');
        return null;
      }
      
      return await this.redis.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Set expiration time for a key
   * @param key The key to set expiration for
   * @param seconds TTL in seconds
   * @returns true if successful, false otherwise
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis is not connected, expire operation failed');
        return false;
      }
      
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get connection status
   * @returns true if connected, false otherwise
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get Redis client instance (for advanced operations)
   * @returns Redis client instance
   */
  getClient(): Redis {
    return this.redis;
  }
}
