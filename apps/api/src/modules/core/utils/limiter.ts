import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

import { RedisService } from '@/modules/redis/services';

@Injectable()
export class BaseLimiter {
    private luaScript: string;

    private client: Redis;

    constructor(private redisSerivce: RedisService) {
        this.client = this.redisSerivce.getClient();
        this.luaScript = `
            -- 1, 2, 3, 4, 5, 6, 7 这是你的元素
            -- ZREMRANGEBYSCORE key1 0 6
            -- 7 执行完之后
            
            -- 限流对象
            local key = KEYS[1]
            -- 窗口大小
            local size = tonumber(ARGV[1])
            -- 阈值
            local threshold = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])
            -- 窗口的起始时间
            local start = now - size
            
            -- 把起始时间前的请求都删了
            redis.call('ZREMRANGEBYSCORE', key, '-inf', start)
            -- 窗口的请求次数
            local cnt = redis.call('ZCOUNT', key, '-inf', '+inf')
            -- local cnt = redis.call('ZCOUNT', key, min, '+inf')
            if cnt >= threshold then
                -- 执行限流
                return "true"
            else
                -- 把 score 和 member 都设置成 now
                redis.call('ZADD', key, now, now)
                -- 设定过期时间
                redis.call('PEXPIRE', key, size)
                return "false"
            end
        `;
    }

    async limit(key: string): Promise<boolean> {
        try {
            const limited = await this.client.eval(
                this.luaScript,
                1,
                key,
                // this.interval,
                60000,
                // this.rate,
                100,
                Date.now(),
            );
            return limited === 'true';
        } catch (error) {
            console.log('error ', error);
            // redis挂了，保护服务器
            return false;
        }
    }
}
