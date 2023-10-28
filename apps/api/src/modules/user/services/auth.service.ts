import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { isNil, omit } from 'lodash';
import * as uuid from 'uuid';

import { RedisService } from '@/modules/redis/services';

import { UserEntity } from '../entities';
import { JwtPayload } from '../types';

import { UserService } from '.';

@Injectable()
export class AuthService {
    private client: Redis;

    constructor(
        protected userService: UserService,
        private readonly accessTokenJwtService: JwtService,
        @Inject('REFRESH_TOKEN_JWT_SERVICE')
        private readonly refreshTokenJwtService: JwtService,
        private readonly redisService: RedisService,
    ) {
        this.client = this.redisService.getClient();
    }

    /**
     * 校验密码是否正确
     * @param credential
     * @param password
     */
    async validateByCredential(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(credential);
        if (isNil(user)) return null;
        const res = bcrypt.compareSync(password, user.password);
        if (res) {
            return omit(user, ['password']);
        }
        return null;
    }

    async login(userId: string, ua: string) {
        const ssid = uuid.v4();
        const payload: JwtPayload = {
            ssid,
            userId,
            ua,
        };
        const accessToken = this.accessTokenJwtService.sign(payload);
        const refreshToken = this.refreshTokenJwtService.sign(payload);
        return {
            accessToken,
            refreshToken,
        };
    }

    async verifyPayload(
        request: FastifyRequest,
        payload: JwtPayload,
    ): Promise<ClassToPlain<UserEntity>> {
        const { ua, userId, ssid } = payload;
        const userAgent = request.headers['user-agent'];
        if (userAgent !== ua) return null;
        // 判断是否已经退出了
        let logout = 0;
        try {
            logout = await this.client.exists(this.key(ssid));
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED') {
                console.error('redis连接挂了');
            }
        }
        // 存在这个key，说明已退出
        if (logout === 1) return null;

        const user = this.userService.findOneById(userId);
        return user;
    }

    protected key(ssid: string) {
        return `users:ssid:${ssid}`;
    }
}
