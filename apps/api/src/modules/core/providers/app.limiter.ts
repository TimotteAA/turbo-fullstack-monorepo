import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { BaseLimiter } from '../utils';

@Injectable()
export class AppLimiter implements NestMiddleware {
    limiter: BaseLimiter;

    constructor(limiter: BaseLimiter) {
        this.limiter = limiter;
    }

    async use(req: FastifyRequest['raw'], _res: FastifyReply['raw'], next: (error?: any) => void) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const key = `ip:limiter:${ip}`;
        const limited = await this.limiter.limit(key);
        if (limited) {
            next(new HttpException('请求次数太多', 429));
        }
        next();
    }
}
