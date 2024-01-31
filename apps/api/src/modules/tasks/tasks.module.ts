import { DynamicModule, ExistingProvider, Module } from '@nestjs/common';

import { HttpRequestJob } from './jobs/http-request.job';

const providers = [HttpRequestJob];

/**
 * auto create alias
 * {
 *    provide: 'LogClearMissionService',
 *    useExisting: LogClearMissionService,
 *  }
 */
function createAliasProviders(): ExistingProvider[] {
    const aliasProviders: ExistingProvider[] = [];
    for (const p of providers) {
        aliasProviders.push({
            provide: p.name,
            useExisting: p,
        });
    }
    return aliasProviders;
}

/**
 * 所有需要执行的定时任务都需要在这里注册
 */
@Module({})
export class TasksModule {
    static async forRoot(): Promise<DynamicModule> {
        // 使用Alias定义别名，使得可以通过字符串类型获取定义的Service，否则无法获取
        const aliasProviders = createAliasProviders();
        return {
            global: true,
            module: TasksModule,
            providers: [...providers, ...aliasProviders],
            exports: aliasProviders,
        };
    }
}
