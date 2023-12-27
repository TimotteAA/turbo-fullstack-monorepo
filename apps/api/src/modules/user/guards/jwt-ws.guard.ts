import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import type { FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import { isNil } from 'lodash';

import { RedisService } from '@/modules/redis/services';

import { AuthService } from '../services';
import { JwtPayload } from '../types';

@Injectable()
export class WsJwtGuard {
    private client: Redis;

    constructor(
        protected readonly jwtService: JwtService,
        protected readonly redisService: RedisService,
        protected readonly authService: AuthService,
    ) {
        this.client = this.redisService.getClient();
    }

    async canActivate(context: ExecutionContext) {
        const { token } = context.switchToWs().getData() || {};
        if (!token) {
            throw new WsException('请登录');
        }
        // redis里存了没
        const exists = await this.client.exists(token);
        if (exists !== 1) throw new WsException('请登录');
        const data = await this.jwtService.verifyAsync<JwtPayload>(token);
        if (isNil(data)) throw new WsException('请登录');
        const user = await this.authService.verifyPayload({} as FastifyRequest, data);
        return !isNil(user);
    }
}
