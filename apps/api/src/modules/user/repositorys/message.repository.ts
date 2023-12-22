import { SelectQueryBuilder } from 'typeorm';

import { BaseRepository } from '@/modules/database/base';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { MessageEntity } from '../entities';

@CUSTOM_REPOSITORY(MessageEntity)
export class MessageRepository extends BaseRepository<MessageEntity> {
    protected _alias: string = 'message';

    buildBaseQB(): SelectQueryBuilder<MessageEntity> {
        return this.createQueryBuilder('message').orderBy(`${this.alias}.createdAt`, 'DESC');
    }
}
