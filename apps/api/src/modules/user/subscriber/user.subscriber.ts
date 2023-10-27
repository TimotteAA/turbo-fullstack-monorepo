import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import bcrypt from 'bcrypt';

import { UserEntity } from '../entities';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return UserEntity;
    }

    beforeInsert(event: InsertEvent<UserEntity>) {
        event.entity.password = bcrypt.hashSync(event.entity.password, 10);
    }
}
