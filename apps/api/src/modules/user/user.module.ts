import { Module, ModuleMetadata } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';

import * as entityMaps from './entities';
import * as guardMaps from './guards';
import * as repoMaps from './repositorys';
import * as serviceMaps from './services';
import * as stragetyMaps from './strategy';
import * as subscriberMaps from './subscriber';

@Module({})
export class UserModule {
    static async forRoot(_configure: Configure) {
        const providers: ModuleMetadata['providers'] = [];
        providers.push(
            ...Object.values(serviceMaps),
            ...Object.values(subscriberMaps),
            ...Object.values(stragetyMaps),
            ...Object.values(guardMaps),
        );

        const imports: ModuleMetadata['imports'] = [
            TypeOrmModule.forFeature(Object.values(entityMaps)),
            DatabaseModule.forRepository(Object.values(repoMaps)),
            // passport
            PassportModule,
        ];

        const exports: ModuleMetadata['exports'] = [
            DatabaseModule.forRepository(Object.values(repoMaps)),
            serviceMaps.UserService,
            serviceMaps.AuthService,
        ];

        return {
            module: UserModule,
            imports,
            providers,
            exports,
        };
    }
}
