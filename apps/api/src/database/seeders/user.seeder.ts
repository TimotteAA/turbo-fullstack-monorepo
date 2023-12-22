import { DataSource, EntityManager } from 'typeorm';

import { BaseSeeder } from '@/modules/database/base';
import { DbMock } from '@/modules/database/types';
import { SystemRoles } from '@/modules/rbac/constants';
import { ResourceEntity, RoleEntity } from '@/modules/rbac/entities';
import { RbacResolver } from '@/modules/rbac/rbac.resolver';
import { UserEntity } from '@/modules/user/entities';

import { IUserMockOptions } from '../mocks/user.mock';

export class UserSeeder extends BaseSeeder {
    protected truncates = [UserEntity, RoleEntity, ResourceEntity, 'rbac_roles_users_users'];

    private mock: DbMock;

    private async initRbac() {
        const resolver = new RbacResolver(this.dataSource, this.configure);
        resolver.setOptions({});
        await resolver.syncRoles(this.em);
        await resolver.syncPermissions(this.em);
    }

    private async loadUsers() {
        const options: IUserMockOptions[] = [
            {
                name: '小明',
                phone: '+86.13111111111',
                password: '123456aA!',
            },
            {
                name: '小李',
                phone: '+86.12343131313',
                password: '123456aA!',
            },
        ];
        for (const option of options) {
            const user = await this.mock(UserEntity)<IUserMockOptions>(option).create({}, 'name');
            await this.em.save(user);
        }
        const roles = await this.em.find(RoleEntity, {
            where: {
                name: SystemRoles.USER,
            },
        });
        await this.mock(UserEntity)<IUserMockOptions>({ roles }).createMany(20, {}, 'name');
    }

    protected async run(_mock: DbMock, _dataSource: DataSource, _em: EntityManager): Promise<any> {
        this.mock = _mock;
        this.dataSource = _dataSource;
        this.em = _em;
        await this.initRbac();
        await this.loadUsers();
    }
}
