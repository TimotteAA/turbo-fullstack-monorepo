import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { isNil, omit, toNumber } from 'lodash';
import * as uuid from 'uuid';

import { Configure } from '@/modules/config/configure';
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
        private readonly redisService: RedisService,
        private readonly configure: Configure,
    ) {
        this.client = this.redisService.getClient();
        // 会话保持14天
        this.expiraTime = this.configure.env.get<number>(
            'REFRESH_TOKEN_EXPIRES_IN',
            toNumber,
            60 * 60 * 24 * 14,
        );
        console.log('this ex', this.expiraTime);
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

        return {
            accessToken,
            refreshToken,
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
        const { ua, userId, ssid } = payload;
        const userAgent = request.headers['user-agent'];
        if (userAgent !== ua) return null;
        const isLogOut = await this.checkIsLogout(ssid);
        if (isLogOut) return null;
        const isInBlackList = await this.checkIsInBlackList(userId);
        if (isInBlackList) return null;

        const user = this.userService.findOneById(userId);
        return user;
    }

    /**
     * 根据refreshToken进行刷新
     * @param request
     */
    async refreshToken(request: FastifyRequest) {
        const refreshToken = request.headers['x-jwt-refresh-token'] as string;
        // 没带refreshToken
        if (isNil(refreshToken)) {
            throw new UnauthorizedException();
        }
        // 带了refreshToken，校验payload
        let payload: JwtPayload;
        try {
            payload = await this.refreshTokenJwtService.verifyAsync(refreshToken);
        } catch (err) {
            // token不对、或者过期了
            throw new UnauthorizedException();
        }
        const { ssid, ua, userId } = payload;
        // 检查Ua
        const requestUa = request.headers['user-agent'];
        if (requestUa !== ua) throw new UnauthorizedException();
        // 检查ssid是否在登出的列表中
        const logouted = await this.checkIsLogout(ssid);
        if (logouted) throw new UnauthorizedException();
        // 检查userId是否在黑名单中
        const isInBlackList = await this.checkIsInBlackList(userId);
        if (isInBlackList) throw new UnauthorizedException();
        // 生成新的accessToken和refreshToken
        const newPayload: JwtPayload = {
            ssid: uuid.v4(),
            userId,
            ua,
        };
        const newAccessToken = await this.accessTokenJwtService.signAsync(newPayload);
        const newRefreshToken = await this.refreshTokenJwtService.signAsync(newPayload);
        return {
            newAccessToken,
            newRefreshToken,
        };
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

    async addToBlackList(userId: string) {
        const key = `users:black`;
        try {
            await this.client.sadd(key, userId);
        } catch (err) {
            console.error('添加黑名单失败 ', err);
        }
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
}
