import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class CoreModule {
    static forRoot(): DynamicModule {
        return {
            global: true,
            providers: [],
            module: CoreModule,
            exports: [],
        };
    }
}
