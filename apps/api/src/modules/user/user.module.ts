import { Module, ModuleMetadata } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { isNil } from 'lodash';

import { Configure } from '../config/configure';
import { panic } from '../core/utils';
import { DatabaseModule } from '../database/database.module';
import { addEntities } from '../database/helpers';
import { RbacModule } from '../rbac/rbac.module';
import { RedisModule } from '../redis/redis.module';

import * as entityMaps from './entities';
import * as guardMaps from './guards';
import * as repoMaps from './repositorys';
import * as serviceMaps from './services';
import * as stragetyMaps from './strategy';
import * as subscriberMaps from './subscriber';
import type { UserModuleConfig } from './types';

@Module({})
export class UserModule {
    static async forRoot(configure: Configure) {
        const user = await configure.get<UserModuleConfig>('user');
        if (isNil(user)) {
            panic({ message: '用户模块没有配置!' });
        }
        const providers: ModuleMetadata['providers'] = [];
        providers.push(
            ...Object.values(serviceMaps),
            ...Object.values(subscriberMaps),
            // ...Object.values(stragetyMaps),
            stragetyMaps.LocalStrategy,
            ...Object.values(guardMaps),
            {
                provide: 'REFRESH_TOKEN_JWT_SERVICE',
                useFactory: () => {
                    return new JwtService({
                        secret: user.jwt.refreshTokenSecret,
                        signOptions: { expiresIn: user.jwt.refreshTokenExpiresIn },
                    });
                },
            },
            {
                inject: [serviceMaps.AuthService],
                provide: stragetyMaps.JwtStrategy,
                useFactory(authService: serviceMaps.AuthService) {
                    const jwtStrategy = new stragetyMaps.JwtStrategy(user, authService);
                    return jwtStrategy;
                },
            },
        );

        const imports: ModuleMetadata['imports'] = [
            // TypeOrmModule.forFeature(Object.values(entityMaps)),
            addEntities(configure, [...Object.values(entityMaps)]),
            DatabaseModule.forRepository(Object.values(repoMaps)),
            // passport
            PassportModule,
            // jwt
            JwtModule.register({
                secret: user.jwt.accessTokenSecret,
                signOptions: {
                    expiresIn: user.jwt.accessTokenExpiresIn,
                    // expiresIn: '1s',
                },
            }),
            // redis
            RedisModule,
            RbacModule,
        ];

        const exports: ModuleMetadata['exports'] = [
            DatabaseModule.forRepository(Object.values(repoMaps)),
            serviceMaps.UserService,
            serviceMaps.AuthService,
            'REFRESH_TOKEN_JWT_SERVICE',
        ];

        return {
            module: UserModule,
            imports,
            providers,
            exports,
        };
    }
}
