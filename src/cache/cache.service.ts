import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  constructor(private readonly redisService: RedisService) {}

  /**
   * Generate a cache key based on prefix and identifier
   * @param prefix The cache key prefix
   * @param identifier The unique identifier
   * @returns Formatted cache key
   */
  generateKey(prefix: string, identifier: string): string {
    return `cache:${prefix}:${identifier}`;
  }

  /**
   * Get cached data by key
   * @param key The cache key
   * @returns The cached data or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisService.get<string>(key);
      if (!data) {
        return null;
      }
      return this.deserialize<T>(data);
    } catch (error) {
      this.logger.error(`Error getting cached data for key ${key}: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Set data in cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttl TTL in seconds (defaults to 1 hour)
   * @returns true if successful, false otherwise
   */
  async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const serializedData = this.serialize(data);
      return await this.redisService.set(key, serializedData, ttl);
    } catch (error) {
      this.logger.error(`Error setting cached data for key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Delete cached data by key
   * @param key The cache key
   * @returns true if successful, false otherwise
   */
  async delete(key: string): Promise<boolean> {
    try {
      return await this.redisService.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cached data for key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param key The cache key
   * @returns true if exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      return await this.redisService.exists(key);
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Serialize data to string
   * @param data The data to serialize
   * @returns Serialized string
   */
  private serialize<T>(data: T): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      this.logger.error(`Error serializing data: ${error.message}`, error.stack);
      throw new Error(`Failed to serialize data: ${error.message}`);
    }
  }

  /**
   * Deserialize string to data
   * @param data The string to deserialize
   * @returns Deserialized data
   */
  private deserialize<T>(data: string): T {
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Error deserializing data: ${error.message}`, error.stack);
      throw new Error(`Failed to deserialize data: ${error.message}`);
    }
  }

  /**
   * Get the default TTL value
   * @returns Default TTL in seconds
   */
  getDefaultTTL(): number {
    return this.DEFAULT_TTL;
  }
}
