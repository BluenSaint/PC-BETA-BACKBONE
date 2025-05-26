import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { CacheModule } from '../cache/cache.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { RedisTestController } from './redis-test.controller';

@Module({
  imports: [
    RedisModule,
    CacheModule,
    RateLimitModule,
  ],
  controllers: [RedisTestController],
})
export class TestModule {}
