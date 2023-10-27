import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { isNil, omit } from 'lodash';

import { UserService } from '.';

@Injectable()
export class AuthService {
    constructor(protected userService: UserService) {}

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
}
