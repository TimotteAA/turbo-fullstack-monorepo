import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue, RepeatOptions } from 'bullmq';

import { TASK_QUEUE } from '../constants';
import { TaskQueueJobData } from '../types';

import { TaskService } from './task.service';
import { TaskWorker } from './task.worker';

@Injectable()
export class TaskQueue {
    constructor(
        @InjectQueue(TASK_QUEUE) protected readonly queue: Queue,
        protected readonly worker: TaskWorker,
        protected readonly service: TaskService,
    ) {
        this.worker.addWorker();
    }

    async addTask(task: TaskQueueJobData, repeat: RepeatOptions) {
        return this.queue.add(task.service, task, {
            jobId: task.id,
            removeOnComplete: true,
            removeOnFail: true,
            repeat,
        });
    }

    /**
     * 找到所有的重复任务
     */
    async getRepeatableJobs() {
        return this.queue.getRepeatableJobs();
    }

    getJobs() {
        return this.queue.getJobs([
            'active',
            'delayed',
            'completed',
            'failed',
            'paused',
            'waiting',
        ]);
    }
}
