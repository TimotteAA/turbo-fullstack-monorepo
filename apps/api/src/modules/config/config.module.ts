import { DynamicModule, Module } from '@nestjs/common';

import { Configure } from './configure';

@Module({})
export class ConfigModule {
    static forRoot(configure: Configure): DynamicModule {
        return {
            global: true,
            providers: [
                {
                    provide: Configure,
                    useValue: configure,
                },
            ],
            module: ConfigModule,
            exports: [Configure],
        };
    }
}
