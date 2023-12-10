import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { FastifyRequest } from 'fastify';
import { isNil, omit } from 'lodash';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../services';
import type { JwtPayload, UserModuleConfig } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        protected userConfig: UserModuleConfig,
        protected authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: userConfig.jwt.accessTokenSecret,
            // 在valdiate方法中拿到request
            passReqToCallback: true,
        });
    }

    async validate(request: FastifyRequest, payload: JwtPayload) {
        console.log('wtf');
        const user = await this.authService.verifyPayload(request, payload);
        if (isNil(user)) throw new UnauthorizedException();

        // ssid for logout
        return { ...omit(user, ['password']), ssid: payload.ssid };
    }
}
