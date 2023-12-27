import { randomBytes } from 'crypto';

import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';

import { RoleService } from '@/modules/rbac/services';

import { UserEntity } from '../entities';
import { encrypt } from '../helpers';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    constructor(
        dataSource: DataSource,
        protected roleService: RoleService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return UserEntity;
    }

    async beforeInsert(event: InsertEvent<UserEntity>) {
        // 手机号、邮箱注册的，创建用户名
        if (!event.entity.name && !event.entity.id) {
            event.entity.name = await this.generateUserName(event);
        }

        if (!event.entity.password) {
            event.entity.password = '123456aA!';
        }

        event.entity.password = await encrypt(event.entity.password, 10);
    }

    async afterLoad(entity: UserEntity): Promise<void> {
        entity.menus = await this.roleService.getMenus(entity.id);
        entity.permissionCodes = await this.roleService.getPermissions(entity.id);
    }

    /**
     * 生成不重复的随机用户名
     * @param event
     */
    protected async generateUserName(event: InsertEvent<UserEntity>): Promise<string> {
        const username = `user_${randomBytes(4).toString('hex').slice(0, 8)}`;
        const user = await event.manager.findOne(UserEntity, {
            where: { name: username },
        });
        return !user ? username : this.generateUserName(event);
    }
}
