import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
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
        const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        // 没有携带token
        if (isNil(headerToken)) throw new UnauthorizedException();
        // 利用原生的jwt stragety校验

        try {
            return (await super.canActivate(context)) as boolean;
        } catch (err) {
            // 校验出错，让前端去续期token
            throw new UnauthorizedException();
        }
    }
}
