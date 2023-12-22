import { Column, Entity, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { MessageEntity } from './message.entity';
import { UserEntity } from './user.entity';

@Entity('message_receiver')
export class MessageReceiverEntity extends BaseEntity {
    @ManyToOne(() => UserEntity, (user) => user.messageToReceivers, {
        onDelete: 'CASCADE',
    })
    receiver: Relation<UserEntity>;

    @ManyToOne(() => MessageEntity, (message) => message.messageToReceivers, {
        onDelete: 'CASCADE',
    })
    message: Relation<MessageEntity>;

    @Column({ type: 'boolean' })
    readed?: boolean;
}
