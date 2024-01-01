import { DynamicModule, Module } from '@nestjs/common';

import { Configure } from '../config/configure';
import { createAliasProviders } from '../task/helper';

import * as serviceMaps from './services';
import { SmtpClientConfig } from './types';

@Module({})
export class MissionModule {
    static async fooRoot(configure: Configure): Promise<DynamicModule> {
        const smtp = await configure.get<SmtpClientConfig>('smtp');
        return {
            global: true,
            providers: [
                {
                    provide: serviceMaps.SmtpService,
                    useFactory() {
                        return new serviceMaps.SmtpService(smtp);
                    },
                },
                ...createAliasProviders(Object.values(serviceMaps)),
            ],
            exports: [...Object.values(serviceMaps)],
            module: MissionModule,
        };
    }
}
