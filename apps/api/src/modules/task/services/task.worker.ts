import { BadRequestException, Injectable, NotFoundException, Type } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { UnknownElementException } from '@nestjs/core/errors/exceptions/unknown-element.exception';
import { Job, Worker } from 'bullmq';

import { MISSION_DECORATOR_KEY, TASK_QUEUE } from '../constants';
import type { TaskQueueJobData } from '../types';

@Injectable()
export class TaskWorker {
    constructor(
        protected readonly reflector: Reflector,
        protected readonly moduleRef: ModuleRef,
    ) {}

    async addWorker() {
        return new Worker(
            TASK_QUEUE,
            async (job: Job<any>) => {
                this.executeJob(job);
            },
            {
                concurrency: 50,
                connection: {
                    port: 6381,
                    host: 'localhost',
                },
            },
        );
    }

    async executeJob(job: Job<TaskQueueJobData>) {
        const startTime = Date.now();
        const { data } = job;
        console.log('execuJob ', data);
        try {
            await this.callService(data.service, data.args);
            const timing = Date.now() - startTime;
            // 执行成功
            console.log(`任务${data.service}执行成功，用时${timing}`);
        } catch (e) {
            console.log('errr ', e);
            const timing = Date.now() - startTime;
            console.log(`任务${data.service}执行失败，用时${timing}`);
        }
    }

    async checkIsValidMission(nameOrInstance: string | Type<any>, methodName: string) {
        console.log('check is Valid');
        try {
            let service: Type<any>;
            if (typeof nameOrInstance === 'string') {
                service = this.moduleRef.get(nameOrInstance, { strict: false });
            } else {
                service = nameOrInstance;
            }
            console.log('service ', service);

            // 是否有任务注解
            const hasMission = this.reflector.get<boolean>(
                MISSION_DECORATOR_KEY,
                service.constructor,
            );

            console.log('hasMission ', hasMission);
            if (!hasMission) {
                throw new BadRequestException('该任务不可调用');
            }
        } catch (err) {
            console.log('err ', err);
            if (err instanceof UnknownElementException) {
                throw new NotFoundException('任务不存在');
            } else {
                // 继续抛出

                throw err;
            }
        }
    }

    async callService(name: string, args: string) {
        const [serviceName, methodName] = name.split('.');
        console.log('adsasdas ', serviceName, methodName);
        // try {
        //     const service = this.moduleRef.get(serviceName, {
        //         strict: false,
        //     });
        //     console.log('service ', service);
        //     console.log('wtf1 ');
        //     // await this.checkIsValidMission(service, methodName);
        //     if (isEmpty(args)) {
        //         await service[methodName]();
        //     } else {
        //         const parseArgs = await this.parseArgs(args);

        //         if (Array.isArray(parseArgs)) {
        //             await service[methodName](...parseArgs);
        //         } else {
        //             await service[methodName](parseArgs);
        //         }
        //     }
        // } catch (err) {
        //     console.error('err ', err);
        // }
        // if (!methodName) throw new BadRequestException(`service does not has method ${methodName}`);
    }

    protected parseArgs(args: string): unknown {
        try {
            return JSON.parse(args);
        } catch (e) {
            return args;
        }
    }
}
