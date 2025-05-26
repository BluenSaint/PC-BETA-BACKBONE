import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RedisService } from '../redis/redis.service';
import { CacheService } from '../cache/cache.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';

@ApiTags('Test')
@Controller('test')
export class RedisTestController {
  constructor(
    private readonly redisService: RedisService,
    private readonly cacheService: CacheService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  @Get('redis')
  @ApiOperation({ summary: 'Test Redis connection and operations' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Redis test results' })
  async testRedis() {
    const isConnected = this.redisService.isRedisConnected();
    const testKey = 'test:redis:connection';
    const testValue = `Test value: ${new Date().toISOString()}`;
    
    let setResult = false;
    let getResult = null;
    let delResult = false;
    
    if (isConnected) {
      // Test set operation
      setResult = await this.redisService.set(testKey, testValue, 60);
      
      // Test get operation
      getResult = await this.redisService.get(testKey);
      
      // Test delete operation
      delResult = await this.redisService.del(testKey);
    }
    
    return {
      status: isConnected ? 'success' : 'failure',
      connected: isConnected,
      operations: {
        set: setResult,
        get: getResult === testValue,
        getValue: getResult,
        delete: delResult,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('cache')
  @ApiOperation({ summary: 'Test Cache service functionality' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cache test results' })
  @ApiQuery({ name: 'key', required: false, description: 'Custom cache key to test' })
  async testCache(@Query('key') customKey?: string) {
    const testKey = customKey || `cache:test:${Date.now()}`;
    const testData = {
      message: 'Test cache data',
      timestamp: new Date().toISOString(),
      random: Math.random(),
    };
    
    // Test cache operations
    const setResult = await this.cacheService.set(testKey, testData, 60);
    const existsResult = await this.cacheService.exists(testKey);
    const getResult = await this.cacheService.get(testKey);
    const deleteResult = await this.cacheService.delete(testKey);
    const existsAfterDelete = await this.cacheService.exists(testKey);
    
    return {
      status: setResult ? 'success' : 'failure',
      operations: {
        set: setResult,
        exists: existsResult,
        get: getResult !== null,
        getData: getResult,
        delete: deleteResult,
        existsAfterDelete: existsAfterDelete,
      },
      defaultTTL: this.cacheService.getDefaultTTL(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('rate-limit')
  @ApiOperation({ summary: 'Test Rate Limiting service functionality' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rate limit test results' })
  @ApiQuery({ name: 'identifier', required: false, description: 'Custom identifier for rate limiting' })
  @ApiQuery({ name: 'action', required: false, description: 'Custom action name for rate limiting' })
  async testRateLimit(
    @Query('identifier') identifier?: string,
    @Query('action') action?: string,
  ) {
    const testIdentifier = identifier || `test-user-${Date.now()}`;
    const testAction = action || 'test-action';
    
    // Get default values
    const defaults = this.rateLimitService.getDefaults();
    
    // Test first request (should be allowed)
    const firstCheck = await this.rateLimitService.checkRateLimit(testIdentifier, testAction);
    
    // Test multiple requests to see counter increment
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(await this.rateLimitService.checkRateLimit(testIdentifier, testAction));
    }
    
    // Reset the rate limit
    const resetResult = await this.rateLimitService.resetRateLimit(testIdentifier, testAction);
    
    // Check after reset
    const afterReset = await this.rateLimitService.checkRateLimit(testIdentifier, testAction);
    
    return {
      status: 'success',
      defaults,
      operations: {
        firstCheck,
        multipleChecks: results,
        reset: resetResult,
        afterReset,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
