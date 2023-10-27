import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { isNil, omit } from 'lodash';
import * as uuid from 'uuid';

import { UserService } from '.';

@Injectable()
export class AuthService {
    constructor(
        protected userService: UserService,
        private readonly accessTokenJwtService: JwtService,
        @Inject('REFRESH_TOKEN_JWT_SERVICE')
        private readonly refreshTokenJwtService: JwtService,
    ) {}

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

    async login(userId: string) {
        const ssid = uuid.v4();
        const payload = {
            ssid,
            userId,
        };
        const accessToken = this.accessTokenJwtService.sign(payload);
        const refreshToken = this.refreshTokenJwtService.sign(payload);
        return {
            accessToken,
            refreshToken,
        };
    }
}
