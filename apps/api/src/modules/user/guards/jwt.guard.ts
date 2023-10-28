import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isNil } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { ALLOW_GUEST } from '../constants';
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
        const allowGuest = Reflect.getMetadata(
            ALLOW_GUEST,
            context.getClass().prototype,
            context.getHandler().name,
        );
        if (allowGuest) return true;
        const request = context.switchToHttp().getRequest();
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        // 没有携带token
        if (isNil(token)) throw new UnauthorizedException();
        // 利用原生的jwt stragety校验
        try {
            return (await super.canActivate(context)) as boolean;
        } catch (err) {
            // 校验失败，尝试续期

            // 续期成功再次校验
            return (await super.canActivate(context)) as boolean;
        }
    }
}
