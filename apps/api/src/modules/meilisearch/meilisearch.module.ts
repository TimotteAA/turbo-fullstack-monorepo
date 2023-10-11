import { Module } from '@nestjs/common';

import { Configure } from '../config/configure';
import { panic } from '../core/utils';

import { MeiliSearchService } from './services';

@Module({})
export class MeiliSearchModule {
    static async forRoot(configure: Configure) {
        if (!configure.has('meilli')) {
            panic({ message: 'Database config not exists or not right!' });
        }
        return {
            global: true,
            module: MeiliSearchModule,
            providers: [
                {
                    provide: MeiliSearchService,
                    useFactory: async () => {
                        const service = new MeiliSearchService(await configure.get('meilli'));
                        service.initClients();
                        return service;
                    },
                },
            ],
            exports: [MeiliSearchService],
        };
    }
}
