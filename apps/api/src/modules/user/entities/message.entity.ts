import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { MessageType } from '../constants';

import { MessageReceiverEntity } from './message-receiver.entity';
import { UserEntity } from './user.entity';

@Entity('messages')
export class MessageEntity extends BaseEntity {
    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'text', comment: '消息内容', nullable: false })
    body: string;

    @Column({
        comment: '消息类型',
        enum: MessageType,
        default: MessageType.MESSAGE,
        nullable: true,
    })
    type?: string;

    @CreateDateColumn({ comment: '发送消息的日期' })
    createAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.sends, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    sender!: Relation<UserEntity>;

    /**
     * 用于标识接受者的字段，多对多
     */
    @OneToMany(() => MessageReceiverEntity, (mr) => mr.receiver, {
        cascade: true,
    })
    messageToReceivers: Relation<MessageReceiverEntity>;
}
