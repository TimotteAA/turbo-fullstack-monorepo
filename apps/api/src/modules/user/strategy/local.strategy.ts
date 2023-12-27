import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { instanceToPlain } from 'class-transformer';
import { isNil } from 'lodash';
import { Strategy } from 'passport-local';

import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        // 本服务登录字段
        super({
            usernameField: 'credential',
            passwordField: 'password',
        });
    }

    async validate(credential: string, password: string) {
        const user = await this.authService.validateByCredential(credential, password);
        console.log('credential ', credential);
        if (isNil(user)) throw new UnauthorizedException();

        // 把普通的user放到request上去
        return instanceToPlain(user);
    }
}
