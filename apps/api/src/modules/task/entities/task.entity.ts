import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

@Entity('tasks')
export class TaskEntity extends BaseEntity {
    @Column({ comment: '任务名称', length: 50, unique: true, nullable: false })
    name!: string;

    @Column({ comment: '任务所调用的服务及其方法', nullable: false })
    service!: string;

    @Column({ type: 'tinyint', default: 0, comment: '任务类型：0 cron，1 间隔' })
    type: number;

    @Column({ type: 'tinyint', default: 1, comment: '任务是否启用：0禁用，1启用' })
    status: number;

    @Column({ type: 'datetime', nullable: true, comment: '开始时间' })
    startTime?: Date;

    @Column({ type: 'datetime', nullable: true, comment: '结束时间' })
    endTime?: Date;

    @Column({ type: 'int', nullable: true, default: 0, comment: '任务的间隔时间' })
    limit?: number;

    @Column({ nullable: true, comment: 'cron表达式' })
    cron?: string;

    @Column({ nullable: true, comment: '执行次数', type: 'int' })
    count?: number;

    @Column({ type: 'simple-json', nullable: true, comment: '任务执行的参数' })
    data?: any;

    @Column({ nullable: true, comment: '任务repeat配置' })
    jobOptions?: string;

    @Column({ nullable: true, comment: '任务简介' })
    description?: string;
}
