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

    private expiraTime: number;

    constructor(
        protected userService: UserService,
        private readonly accessTokenJwtService: JwtService,
        @Inject('REFRESH_TOKEN_JWT_SERVICE')
        private readonly refreshTokenJwtService: JwtService,
        private readonly redisService: RedisService, // private readonly expiraTime: number,
    ) {
        this.client = this.redisService.getClient();
        // 会话保持14天
        this.expiraTime = 60 * 60 * 24 * 14;
    }

    /**
     * 校验密码是否正确
     * @param credential
     * @param password
     */
    async validateByCredential(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(credential);
        if (isNil(user)) return null;
        const res = await bcrypt.compare(password, user.password);
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
        await this.saveSession(ssid, refreshToken);

        return {
            accessToken,
            refreshToken,
        };
    }

    async logout(ssid: string) {
        try {
            await this.client.del(this.key(ssid));
        } catch (err) {
            console.error('redis连接挂了');
        }
    }

    async verifyPayload(
        request: FastifyRequest,
        payload: JwtPayload,
    ): Promise<ClassToPlain<UserEntity>> {
        const { ua, userId, ssid } = payload;
        const userAgent = request.headers['user-agent'];
        if (userAgent !== ua) return null;
        const exists = await this.checkSession(ssid);
        if (!exists) return null;

        const user = this.userService.findOneById(userId);
        return user;
    }

    async refreshToken(token: string) {
        console.log('refreshToken ', token);
        // 先校验accessToken是否正确
        let payload: JwtPayload;
        try {
            payload = await this.accessTokenJwtService.verifyAsync<JwtPayload>(token);
            console.log('payload ', payload);
        } catch (err) {
            console.log('refresh error ', err);
            return null;
        }

        if (!isNil(payload)) {
            const { ssid } = payload;
            const exists = await this.checkSession(ssid);
            console.log('exists ', exists);
            //  退出了、或者没登录过，不续期
            if (!exists) return null;
            const newSsid = uuid.v4();
            const newPayload: JwtPayload = {
                ssid: newSsid,
                userId: payload.userId,
                ua: payload.ua,
            };
            const newAccessToken = this.accessTokenJwtService.sign(newPayload);
            const newRrefreshToken = this.refreshTokenJwtService.sign(newPayload);

            await this.saveSession(newSsid, newRrefreshToken);

            return { token: newAccessToken };
        }
        return null;
    }

    protected key(ssid: string) {
        return `users:ssid:${ssid}`;
    }

    protected async saveSession(ssid: string, refreshToken: string) {
        try {
            await this.client.hset(
                this.key(ssid),
                'refreshToken',
                refreshToken,
                'ssid',
                ssid,
                'EX',
                this.expiraTime,
            );
            await this.client.expire(this.key(ssid), this.expiraTime);
        } catch (err) {
            console.log('存储refreshToken失败');
        }
    }

    protected async checkSession(ssid: string) {
        // 判断是否已经退出了
        let logout = 0;
        try {
            // 1表示key存在
            logout = await this.client.exists(this.key(ssid));
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED') {
                console.error('redis连接挂了');
            }
        }
        return logout === 1;
    }
}
