import Bun from 'bun';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';

import { UserEntity } from '../entities';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return UserEntity;
    }

    async beforeInsert(event: InsertEvent<UserEntity>) {
        event.entity.password = await Bun.password.hash(event.entity.password, {
            cost: 10,
            algorithm: 'bcrypt',
        });
    }
}
