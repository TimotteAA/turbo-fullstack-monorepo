import { faker } from '@faker-js/faker';

import { defindMock } from '@/modules/database/helpers';
import { RoleEntity } from '@/modules/rbac/entities';
import { UserEntity } from '@/modules/user/entities';
import { encrypt } from '@/modules/user/helpers';

export type IUserMockOptions = Partial<{
    roles: RoleEntity[];
    name: string;
    nickname: string;
    email: string;
    phone: string;
    password: string;
    summary?: string;
}>;

export const UserMock = defindMock<UserEntity, IUserMockOptions>(
    UserEntity,
    async (_configure, options) => {
        const user = new UserEntity();
        if (options.name) {
            user.name = options.name;
        } else {
            user.name = faker.lorem.words({ min: 1, max: 4 });
        }
        if (options.nickname) user.nickname = options.nickname;
        if (options.email) user.email = options.email;
        if (options.phone) user.phone = options.phone;
        if (options.password) {
            user.password = options.password;
        } else {
            if (user.name === 'timotte') console.log('user ', user);
            user.password = await encrypt('123456aA!', 10);
        }
        if (options.summary) {
            user.summary = options.summary;
        }
        if (Math.random() > 0.8) user.deletedAt = new Date();

        if (Math.random() > 0.8) {
            user.actived = false;
        } else {
            user.actived = true;
            if (options.roles) user.roles = options.roles;
        }
        return user;
    },
);
