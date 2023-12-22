import { SelectQueryBuilder } from 'typeorm';

import { BaseRepository } from '@/modules/database/base';
import { CUSTOM_REPOSITORY } from '@/modules/database/decorators';

import { MessageReceiverEntity } from '../entities';

@CUSTOM_REPOSITORY(MessageReceiverEntity)
export class MessageReceiverRepository extends BaseRepository<MessageReceiverEntity> {
    protected _alias = 'message-receiver';

    buildBaseQB(): SelectQueryBuilder<MessageReceiverEntity> {
        return this.createQueryBuilder(this.alias);
    }
}
