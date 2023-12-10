import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Bun from 'bun';
import type { FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { isNil, omit, toNumber } from 'lodash';
import * as uuid from 'uuid';

import { Configure } from '@/modules/config/configure';
import { RedisService } from '@/modules/redis/services';

import { UserEntity } from '../entities';
import { UserRepository } from '../repositorys';
import { JwtPayload } from '../types';

import { UserRegisterDto } from '../dtos/auth.dto';

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
        private readonly redisService: RedisService,
        private readonly configure: Configure,
        private readonly userRepo: UserRepository,
    ) {
        this.client = this.redisService.getClient();
        // 存在redis里的时间比accessToken有效期久一个小时，用于后端续期
        this.expiraTime =
            this.configure.env.get<number>(
                'user.jwt.accessTokenExpiresIn',
                toNumber,
                60 * 60 * 24 * 14,
            ) +
            60 * 60 * 1;
    }

    /**
     * 校验密码是否正确
     * @param credential
     * @param password
     */
    async validateByCredential(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(credential);
        if (isNil(user)) return null;
        const res = await Bun.password.verify(password, user.password);
        if (res) {
            return omit(user, ['password']);
        }
        return null;
    }

    /**
     * 用户注册
     * @param data
     */
    async register(data: UserRegisterDto) {
        const user = await this.userRepo.save({ name: data.name, password: data.password });
        const detail = await this.userService.findOneByConditions({ id: user.id });
        return detail;
    }

    /**
     * 用户登录
     * @param userId
     * @param ua
     */
    async login(userId: string, ua: string) {
        // 会话id
        const ssid = uuid.v4();
        const payload: JwtPayload = {
            ssid,
            userId,
            ua,
            signAt: Date.now(),
        };
        const accessToken = this.accessTokenJwtService.sign(payload);
        const refreshToken = this.refreshTokenJwtService.sign(payload);
        await this.saveSessions(userId, accessToken, refreshToken);
        return {
            accessToken,
        };
    }

    /**
     * 验证accessToken的payload是否valid
     * @param request
     * @param payload
     */
    async verifyPayload(
        request: FastifyRequest,
        payload: JwtPayload,
    ): Promise<ClassToPlain<UserEntity>> {
        const { ua, userId, ssid, signAt } = payload;
        const userAgent = request.headers['user-agent'];
        if (userAgent !== ua) return null;
        const isLogOut = await this.checkIsLogout(ssid);
        if (isLogOut) {
            return null;
        }
        const isInBlackList = await this.checkIsInBlackList(userId);
        if (isInBlackList) return null;
        // 检查签发时间是否超过30天
        if (Date.now() - signAt > 30 * 24 * 60 * 60 * 1000) throw new UnauthorizedException();

        const user = await this.userService.findOneById(userId);
        return user;
    }

    /**
     * 根据refreshToken进行刷新
     * @param request
     */
    async refreshToken(accessToken: string) {
        const map = await this.getSessions(accessToken);
        // redis里的也过期了
        if (isNil(map)) return null;

        const { refreshToken, userId } = map;
        if (await this.checkIsInBlackList(userId)) return null;

        // 带了refreshToken，校验payload
        let payload: JwtPayload;
        try {
            payload = await this.refreshTokenJwtService.verifyAsync(refreshToken);
        } catch (err) {
            // token不对、或者过期了
            return null;
        }
        const { ssid, ua, signAt } = payload;
        // 检查ssid是否在登出的列表中
        const logouted = await this.checkIsLogout(ssid);
        if (logouted) throw new UnauthorizedException();
        // 检查签发时间是否超过30天
        if (Date.now() - signAt > 30 * 24 * 60 * 60 * 1000) return null;
        // 生成新的accessToken和refreshToken
        const newPayload: JwtPayload = {
            ssid: uuid.v4(),
            userId,
            ua,
            signAt: Date.now(),
        };
        const newAccessToken = await this.accessTokenJwtService.signAsync(newPayload);
        const newRefreshToken = await this.refreshTokenJwtService.signAsync(newPayload);
        await this.clearSessions(accessToken);
        await this.saveSessions(userId, newAccessToken, newRefreshToken);
        return newAccessToken;
    }

    async addToBlackList(userId: string) {
        const key = `users:black`;
        try {
            await this.client.sadd(key, userId);
        } catch (err) {
            console.error('添加黑名单失败 ', err);
        }
    }

    async logout(ssid: string) {
        try {
            await this.client.set(this.key(ssid), ssid, 'EX', this.expiraTime);
        } catch (err) {
            console.error('redis连接挂了 ', err);
        }
    }

    protected async checkIsLogout(ssid: string) {
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

    protected key(ssid: string) {
        return `users:ssid:${ssid}`;
    }

    protected async checkIsInBlackList(userId: string) {
        const key = `users:black`;
        // 默认在黑名单中，防止redis挂了
        let isInBlackList = 1;
        try {
            [isInBlackList] = await this.client.smismember(key, userId);
        } catch (err) {
            console.error('检查用户在黑名单失败 ', err);
        }
        return isInBlackList === 1;
    }

    protected async saveSessions(userId: string, accessToken: string, refreshToken: string) {
        try {
            // 反向存储token
            await this.client.hset(accessToken, { refreshToken, userId });
            await this.client.expire(accessToken, this.expiraTime);
        } catch (err) {
            console.log(err);
        }
    }

    protected async getSessions(accessToken: string) {
        const map = (await this.client.hgetall(accessToken)) as {
            refreshToken: string;
            userId: string;
        };
        if (isNil(map)) {
            return null;
        }
        return map;
    }

    protected async clearSessions(accessToken: string) {
        try {
            await this.client.del(accessToken);
        } catch (err) {
            console.log(err);
        }
    }
}
