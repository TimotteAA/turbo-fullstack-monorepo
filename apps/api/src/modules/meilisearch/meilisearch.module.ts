import { DynamicModule, Module } from '@nestjs/common';

import { createMeiliSearchModuleConfig } from './helpers';
import { MeiliSearchService } from './services';
import { MeiliSeachModuleConfig } from './types';

@Module({})
export class MeiliSearchModule {
    static forRoot(configFn: () => MeiliSeachModuleConfig): DynamicModule {
        return {
            global: true,
            module: MeiliSearchModule,
            providers: [
                {
                    provide: MeiliSearchService,
                    async useFactory() {
                        const service = new MeiliSearchService(
                            await createMeiliSearchModuleConfig(configFn()),
                        );
                        await service.initClients();
                        return service;
                    },
                },
            ],
            exports: [MeiliSearchService],
        };
    }
}
