import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply } from 'fastify';
import { isNil } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { ALLOW_GUEST } from '@/modules/rbac/decorators/guest.decorator';

import { ALLOW_GUEST_KEY } from '../constants';
import { AuthService } from '../services';

/**
 * jwt鉴权guard：校验jwt token是否过期，如果过期，则返回401
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        protected readonly authService: AuthService,
        protected readonly reflector: Reflector,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        // 允许匿名访问的接口
        // 新的拿装饰器值的方法
        const allowGuest = this.reflector.getAllAndOverride(ALLOW_GUEST, [
            context.getHandler(),
            context.getClass(),
        ]);

        const crudGuest = Reflect.getMetadata(
            ALLOW_GUEST_KEY,
            context.getClass().prototype,
            context.getHandler().name,
        );
        const guest = allowGuest ?? crudGuest;

        if (guest) return true;
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse() as FastifyReply;
        const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        // 没有携带token
        if (isNil(headerToken)) throw new UnauthorizedException();
        // 利用原生的jwt stragety校验

        try {
            const res = await super.canActivate(context);
            return res as boolean;
        } catch (err) {
            if (!isNil(headerToken)) {
                const accessToken = await this.authService.refreshToken(headerToken);
                if (isNil(accessToken)) return false;
                request.headers.authorization = `Bearer ${accessToken}`;
                // response.setHeader('x-jwt-token', accessToken);
                response.header('x-jwt-token', accessToken);
                return (await super.canActivate(context)) as boolean;
            }
            throw new UnauthorizedException();
        }
    }
}
