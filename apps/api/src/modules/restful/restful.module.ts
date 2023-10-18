import { Module } from '@nestjs/common';

import { Configure } from '../config/configure';

import { Restful } from './restful';
import { ApiConfig } from './types';

@Module({})
export class RestfulModule {
    static async forRoot(configure: Configure) {
        const restful = new Restful(configure);
        const config = await configure.get<ApiConfig>('api');
        await restful.create(config);
        return {
            module: RestfulModule,
            providers: [
                {
                    provide: Restful,
                    useValue: restful,
                },
            ],
            global: true,
            imports: restful.getModuleImports(),
            exports: [Restful],
        };
    }
}
