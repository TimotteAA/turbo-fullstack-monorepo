import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Job, RepeatOptions } from 'bullmq';
import type { Redis } from 'ioredis';
import { isNil } from 'lodash';

import { BaseService } from '@/modules/database/base';
import { RedisService } from '@/modules/redis/services';

import { TASK_QUEUE_KEY_PREFIX } from '../constants';
import { TaskEntity } from '../entities';
import { TaskQueue } from '../queues';
import { TaskRepository } from '../repositorys';
import { TaskQueueJobData } from '../types';

@Injectable()
export class TaskService extends BaseService<TaskEntity, TaskRepository> implements OnModuleInit {
    private logger = new Logger(TaskService.name);

    private redis: Redis;

    constructor(
        protected repo: TaskRepository,
        protected taskQueue: TaskQueue,
        protected redisService: RedisService,
    ) {
        super(repo);
        this.redis = redisService.getClient();
    }

    async onModuleInit() {
        await this.initTask();
        if (isNil(await this.repo.findOne({ where: { name: 'test' } }))) {
            await this.repo.save({
                name: 'test',
                type: 0,
                corn: '*/1 * * * *',
                service: 'UserService.test',
                status: 0,
            });
        }
    }

    /**
     * 初始化各个任务，系统启动前调用
     */
    async initTask(): Promise<void> {
        const initRediskey = `${TASK_QUEUE_KEY_PREFIX}:init`;

        // 防止多实例重复初始化，用分布式锁，拿到了才执行任务
        const result = await this.redis
            .multi()
            .setnx(initRediskey, new Date().getTime())
            .expire(initRediskey, 60 * 30)
            .exec();
        // [error, result]
        if (result[0][1] === 0) {
            this.logger.log('Init task is locked', TaskService.name);
        }

        // 老的任务清一清
        const jobs = await this.taskQueue.getJobs();
        jobs.forEach((j) => j.remove());

        // 查找所有要执行的任务
        const tasks = await this.repo.findBy({ status: 1 });
        if (tasks.length && tasks.length > 0) {
            for (const t of tasks) {
                await this.start(t.id);
            }
        }

        // 把锁放了
        await this.redis.del(initRediskey);
    }

    /**
     * 启动一个任务
     * @param task
     */
    async start(taskId: string) {
        // 删除重复任务
        await this.stop(taskId);
        const t = await this.repo.findOne({
            where: {
                id: taskId,
            },
        });
        const repeat: RepeatOptions = {};

        // 间隔执行的任务
        if (t.type === 1) {
            repeat.every = t.count;
        } else {
            // cron任务
            repeat.pattern = t.cron;
            if (t.startTime) repeat.startDate = t.startTime;
            if (t.endTime) repeat.endDate = t.endTime;
        }

        if (t.limit) repeat.limit = t.limit;

        const job = await this.taskQueue.addTask(
            {
                id: t.id,
                service: t.service,
                args: t.data,
            },
            repeat,
        );

        if (job && job.opts) {
            await this.repo.update(t.id, {
                jobOptions: JSON.stringify(job.opts.repeat),
            });
        } else {
            // 没有repeat则任务失败
            await job?.remove();
            await this.repo.update(t.id, {
                status: 0,
            });
            throw new BadRequestException('Task start failed');
        }
    }

    async stop(taskId: string) {
        const task = await this.repo.findOne({ where: { id: taskId } });
        // 先判断任务是否在队列中执行
        const jobs = await this.taskQueue.getRepeatableJobs();
        const ids = jobs.map((j) => j.id);
        if (!ids.includes(task.id)) {
            // 任务不存在，把任务标识成disbaled
            await this.repo.update(task.id, {
                status: 0,
            });
        }
        // 停止任务，并标识成不可以执行
        const js: Job<TaskQueueJobData>[] = await this.taskQueue.getJobs();
        js.filter((job) => job.data.id === task.id).forEach(async (job) => job?.remove());
        await this.repo.update(task.id, { status: 0 });
    }
}
