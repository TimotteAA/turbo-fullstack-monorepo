import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { Configure } from '../config/configure';
import { RedisService } from '../redis/services';

import { AppLimiter } from './providers/app.limiter';
import { BaseLimiter } from './utils';

@Module({})
export class CoreModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AppLimiter).forRoutes('*');
    }

    static forRoot(configure: Configure): DynamicModule {
        return {
            global: true,
            providers: [
                {
                    provide: AppLimiter,
                    async useFactory(redisService: RedisService) {
                        const limiter = new BaseLimiter(redisService);
                        const appLimiter = new AppLimiter(limiter);
                        return appLimiter;
                    },
                    inject: [RedisService],
                },
                BaseLimiter,
            ],
            module: CoreModule,
            exports: [],
        };
    }
}
